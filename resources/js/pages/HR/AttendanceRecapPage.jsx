import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';
import SearchableSelect from '../../components/SearchableSelect';
import {
    CalendarClock,
    Calendar,
    Users,
    Search,
    Plus,
    Edit3,
    Trash2,
    X,
    RefreshCw,
    Save,
    UserCheck,
    CheckCircle2,
    Clock,
    AlertCircle
} from 'lucide-react';

export default function AttendanceRecapPage() {
    const { confirm } = useConfirm();
    const { user } = useAuth();
    const userRole = (user?.role || 'staff').toLowerCase();
    const isHrOrAdmin = ['superadmin', 'administrator', 'admin', 'hr'].includes(userRole);

    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1 - 12
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedDept, setSelectedDept] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [recapData, setRecapData] = useState([]);
    const [daysInMonth, setDaysInMonth] = useState(31);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [viewMode, setViewMode] = useState('summary'); // 'summary' | 'matrix'

    // Single Attendance Manual Entry Modal state
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingAttendanceId, setEditingAttendanceId] = useState(null);

    const [form, setForm] = useState({
        employee_id: '',
        date: new Date().toISOString().split('T')[0],
        clock_in: '08:00',
        clock_out: '17:00',
        status: 'PRESENT',
        notes: 'Absen manual diinput oleh HR',
    });

    // Employee Detail Modal state
    const [showEmpModal, setShowEmpModal] = useState(false);
    const [selectedEmpItem, setSelectedEmpItem] = useState(null);

    // Bulk Monthly Adjustment Modal state
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [submittingBulk, setSubmittingBulk] = useState(false);
    const [bulkForm, setBulkForm] = useState({
        employee_id: '',
        month: selectedMonth,
        year: selectedYear,
        present_count: 0,
        late_count: 0,
        permit_count: 0,
        leave_count: 0,
        absent_count: 0,
        clock_in: '08:00',
        clock_out: '17:00',
        notes: 'Penyesuaian rekap absensi bulanan oleh HR',
    });

    const months = [
        { value: 1, label: 'Januari' },
        { value: 2, label: 'Februari' },
        { value: 3, label: 'Maret' },
        { value: 4, label: 'April' },
        { value: 5, label: 'Mei' },
        { value: 6, label: 'Juni' },
        { value: 7, label: 'Juli' },
        { value: 8, label: 'Agustus' },
        { value: 9, label: 'September' },
        { value: 10, label: 'Oktober' },
        { value: 11, label: 'November' },
        { value: 12, label: 'Desember' },
    ];

    const currentYear = new Date().getFullYear();
    const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

    const fetchInitialData = async () => {
        try {
            const [depRes, empRes] = await Promise.all([
                api.get('/hr/departments').catch(() => ({ data: { data: [] } })),
                api.get('/hr/employees').catch(() => ({ data: { data: [] } })),
            ]);
            setDepartments(depRes.data?.data || []);
            setEmployees(empRes.data?.data || []);
        } catch (err) {
            console.error('Error fetching initial HR data:', err);
        }
    };

    const fetchRecap = async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const res = await api.get('/hr/attendance/recap', {
                params: {
                    month: selectedMonth,
                    year: selectedYear,
                    department_id: selectedDept || undefined,
                }
            });
            const data = res.data?.data || {};
            setRecapData(Array.isArray(data.recap) ? data.recap : []);
            setDaysInMonth(data.days_in_month || 31);
        } catch (err) {
            console.error('Error fetching attendance recap:', err);
            setFetchError(err.response?.data?.message || err.message || 'Gagal memuat data rekap absensi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchRecap();
    }, [selectedMonth, selectedYear, selectedDept]);

    const filteredRecap = (recapData || []).filter(item => {
        if (!item || !item.employee) return false;
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        const name = (item.employee?.full_name || '').toLowerCase();
        const nik = (item.employee?.nik || item.employee?.employee_code || '').toLowerCase();
        return name.includes(q) || nik.includes(q);
    });

    // Aggregates
    const totalPresent = filteredRecap.reduce((acc, i) => acc + (i?.summary?.present || 0), 0);
    const totalLate = filteredRecap.reduce((acc, i) => acc + (i?.summary?.late || 0), 0);
    const totalPermit = filteredRecap.reduce((acc, i) => acc + (i?.summary?.permit || 0) + (i?.summary?.sick || 0), 0);
    const totalLeave = filteredRecap.reduce((acc, i) => acc + (i?.summary?.leave || 0), 0);
    const totalAbsent = filteredRecap.reduce((acc, i) => acc + (i?.summary?.absent || 0), 0);

    const handleOpenEmpDetail = (item) => {
        if (!item || !item.employee) return;
        setSelectedEmpItem(item);
        setShowEmpModal(true);
    };

    const handleOpenManualModal = (empId = null, dateStr = null, existingAtt = null, defaultStatus = 'PRESENT') => {
        const targetDate = dateStr || new Date().toISOString().split('T')[0];
        const targetEmpId = empId || (employees[0]?.id || '');

        if (existingAtt) {
            setEditingAttendanceId(existingAtt.id);
            setForm({
                employee_id: targetEmpId,
                date: targetDate,
                clock_in: existingAtt.clock_in ? String(existingAtt.clock_in).substring(0, 5) : '08:00',
                clock_out: existingAtt.clock_out ? String(existingAtt.clock_out).substring(0, 5) : '17:00',
                status: existingAtt.status || defaultStatus,
                notes: existingAtt.notes || 'Diubah oleh HR',
            });
        } else {
            setEditingAttendanceId(null);
            setForm({
                employee_id: targetEmpId,
                date: targetDate,
                clock_in: (defaultStatus === 'PRESENT' || defaultStatus === 'LATE') ? '08:00' : '',
                clock_out: (defaultStatus === 'PRESENT' || defaultStatus === 'LATE') ? '17:00' : '',
                status: defaultStatus,
                notes: 'Absen manual diinput oleh HR',
            });
        }
        setShowModal(true);
    };

    const handleOpenBulkModal = (item = null) => {
        const emp = item?.employee || employees[0];
        const summary = item?.summary || {};

        setBulkForm({
            employee_id: emp?.id || '',
            month: selectedMonth,
            year: selectedYear,
            present_count: (summary.present !== undefined && summary.present !== null) ? Number(summary.present) : 0,
            late_count: (summary.late !== undefined && summary.late !== null) ? Number(summary.late) : 0,
            permit_count: ((summary.permit || 0) + (summary.sick || 0)),
            leave_count: (summary.leave !== undefined && summary.leave !== null) ? Number(summary.leave) : 0,
            absent_count: (summary.absent !== undefined && summary.absent !== null) ? Number(summary.absent) : 0,
            clock_in: '08:00',
            clock_out: '17:00',
            notes: 'Penyesuaian rekap absensi bulanan oleh HR',
        });
        setShowBulkModal(true);
    };

    const handleSubmitManual = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/hr/attendance/manual', form);
            alert('Data absensi karyawan berhasil disimpan!');
            setShowModal(false);
            fetchRecap();
        } catch (err) {
            alert('Gagal menyimpan absensi: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitBulk = async (e) => {
        e.preventDefault();
        setSubmittingBulk(true);
        try {
            await api.post('/hr/attendance/bulk-monthly', bulkForm);
            alert('Rekap absensi bulanan karyawan berhasil diperbarui!');
            setShowBulkModal(false);
            fetchRecap();
        } catch (err) {
            alert('Gagal memperbarui rekap absensi: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmittingBulk(false);
        }
    };

    const handleDeleteAttendance = async (attId) => {
        const ok = await confirm({
            title: 'Hapus Data Absensi',
            message: 'Apakah Anda yakin ingin menghapus data absensi ini? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/hr/attendance/${attId}`);
            alert('Data absensi berhasil dihapus.');
            setShowModal(false);
            setShowEmpModal(false);
            fetchRecap();
        } catch (err) {
            alert('Gagal menghapus data absensi.');
        }
    };

    const getStatusBadge = (status) => {
        const st = String(status || '').toUpperCase();
        switch (st) {
            case 'PRESENT':
            case 'HADIR':
                return <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">Hadir</span>;
            case 'LATE':
            case 'TERLAMBAT':
                return <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">Terlambat</span>;
            case 'PERMIT':
            case 'IZIN':
                return <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">Izin</span>;
            case 'SICK':
            case 'SAKIT':
                return <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-500/20">Sakit</span>;
            case 'LEAVE':
            case 'CUTI':
                return <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20">Cuti</span>;
            case 'ABSENT':
            case 'ALPA':
                return <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20">Alpa</span>;
            default:
                return <span className="text-slate-400 text-[10px]">-</span>;
        }
    };

    const getMatrixCell = (att, empId, dayNum) => {
        const mm = String(selectedMonth).padStart(2, '0');
        const dd = String(dayNum).padStart(2, '0');
        const dateStr = `${selectedYear}-${mm}-${dd}`;

        if (!att) {
            return (
                <td
                    key={dayNum}
                    onClick={() => isHrOrAdmin && handleOpenManualModal(empId, dateStr, null)}
                    className={`py-2 px-1 text-center font-mono text-[10px] text-slate-300 border-r border-slate-100 dark:border-slate-800 ${isHrOrAdmin ? 'hover:bg-blue-500/10 cursor-pointer' : ''}`}
                    title={isHrOrAdmin ? `Klik untuk input absensi tanggal ${dayNum}` : ''}
                >
                    -
                </td>
            );
        }

        const st = String(att.status || 'PRESENT').toUpperCase();
        let bgClass = 'bg-slate-100 dark:bg-slate-800 text-slate-500';
        let label = 'H';

        if (st === 'PRESENT' || st === 'HADIR') {
            bgClass = 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold';
            label = 'H';
        } else if (st === 'LATE' || st === 'TERLAMBAT') {
            bgClass = 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold';
            label = 'T';
        } else if (st === 'PERMIT' || st === 'IZIN') {
            bgClass = 'bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold';
            label = 'I';
        } else if (st === 'SICK' || st === 'SAKIT') {
            bgClass = 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold';
            label = 'S';
        } else if (st === 'LEAVE' || st === 'CUTI') {
            bgClass = 'bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold';
            label = 'C';
        } else if (st === 'ABSENT' || st === 'ALPA') {
            bgClass = 'bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold';
            label = 'A';
        }

        return (
            <td
                key={dayNum}
                onClick={() => isHrOrAdmin && handleOpenManualModal(empId, dateStr, att)}
                className={`py-1.5 px-1 text-center font-mono text-[10px] border-r border-slate-100 dark:border-slate-800 ${bgClass} ${isHrOrAdmin ? 'cursor-pointer hover:opacity-80' : ''}`}
                title={`${att.clock_in || '-'} s/d ${att.clock_out || '-'} (${att.status || '-'}). Klik untuk edit.`}
            >
                {label}
            </td>
        );
    };

    const monthLabel = months.find(m => m.value === selectedMonth)?.label || 'Bulan Ini';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                        <CalendarClock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span>Rekap Absensi &amp; Kehadiran Bulanan</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Monitoring &amp; rekapitulasi presensi bulanan karyawan serta penyesuaian absensi oleh HR.
                    </p>
                </div>

                {isHrOrAdmin && (
                    <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                        <button
                            type="button"
                            onClick={() => handleOpenBulkModal()}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 transition-all"
                        >
                            <Edit3 className="w-4 h-4" />
                            <span>Edit Total Rekap Bulanan</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleOpenManualModal()}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Input / Edit Harian</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Filter Bar */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm text-xs">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Month Picker */}
                    <div className="flex items-center space-x-2 min-w-[150px]">
                        <label className="font-semibold text-slate-700 dark:text-slate-300">Bulan:</label>
                        <SearchableSelect
                            options={months.map(m => ({ value: m.value, label: m.label }))}
                            value={selectedMonth}
                            onChange={(val) => setSelectedMonth(parseInt(val))}
                            placeholder="Pilih Bulan..."
                            required
                        />
                    </div>

                    {/* Year Picker */}
                    <div className="flex items-center space-x-2 min-w-[120px]">
                        <label className="font-semibold text-slate-700 dark:text-slate-300">Tahun:</label>
                        <SearchableSelect
                            options={years.map(y => ({ value: y, label: String(y) }))}
                            value={selectedYear}
                            onChange={(val) => setSelectedYear(parseInt(val))}
                            placeholder="Pilih Tahun..."
                            required
                        />
                    </div>

                    {/* Dept Filter */}
                    <div className="flex items-center space-x-2 min-w-[180px]">
                        <label className="font-semibold text-slate-700 dark:text-slate-300">Departemen:</label>
                        <SearchableSelect
                            options={[
                                { value: '', label: 'Semua Departemen' },
                                ...departments.map(d => ({ value: d.id, label: d.name }))
                            ]}
                            value={selectedDept}
                            onChange={(val) => setSelectedDept(val)}
                            placeholder="Semua Departemen..."
                        />
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full sm:w-60">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari karyawan / NIK..."
                            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* View Switcher */}
                <div className="flex items-center space-x-2 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
                        <button
                            type="button"
                            onClick={() => setViewMode('summary')}
                            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition-all ${
                                viewMode === 'summary'
                                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                            }`}
                        >
                            <Users className="w-3.5 h-3.5" />
                            <span>Tabel Akumulasi</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('matrix')}
                            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition-all ${
                                viewMode === 'matrix'
                                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                            }`}
                        >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Matrix Kalender</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Hadir</span>
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{totalPresent} Hari</div>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Terlambat</span>
                    <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{totalLate} Kali</div>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Izin / Sakit</span>
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{totalPermit} Hari</div>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Cuti</span>
                    <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{totalLeave} Hari</div>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1 col-span-2 sm:col-span-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Alpa</span>
                    <div className="text-xl font-bold text-rose-600 dark:text-rose-400">{totalAbsent} Hari</div>
                </div>
            </div>

            {/* Recap Content */}
            {loading ? (
                <div className="flex justify-center p-12 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2 text-blue-600 dark:text-blue-400" />
                    <span>Memuat rekap absensi bulanan ({monthLabel} {selectedYear})...</span>
                </div>
            ) : fetchError ? (
                <div className="p-8 text-center border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 space-y-2">
                    <AlertCircle className="w-6 h-6 mx-auto text-rose-500" />
                    <p className="font-bold">{fetchError}</p>
                    <button onClick={fetchRecap} className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold text-xs">Coba Lagi</button>
                </div>
            ) : filteredRecap.length === 0 ? (
                <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 bg-white dark:bg-[#0f172a]">
                    Tidak ada data karyawan yang sesuai dengan kriteria pencarian / filter.
                </div>
            ) : viewMode === 'summary' ? (
                /* SUMMARY TABLE VIEW */
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm text-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                    <th className="py-3 px-4">NIK &amp; Karyawan</th>
                                    <th className="py-3 px-4">Departemen &amp; Jabatan</th>
                                    <th className="py-3 px-4 text-center">Hadir</th>
                                    <th className="py-3 px-4 text-center">Terlambat</th>
                                    <th className="py-3 px-4 text-center">Izin / Sakit</th>
                                    <th className="py-3 px-4 text-center">Cuti</th>
                                    <th className="py-3 px-4 text-center">Alpa</th>
                                    <th className="py-3 px-4 font-mono text-center">Total Jam Kerja</th>
                                    {isHrOrAdmin && <th className="py-3 px-4 text-right">Aksi HR</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {filteredRecap.map((item) => {
                                    if (!item || !item.employee) return null;
                                    return (
                                        <tr key={item.employee.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenEmpDetail(item)}
                                                    className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline text-left cursor-pointer transition-colors block"
                                                    title="Klik untuk lihat detail rekap absensi karyawan ini"
                                                >
                                                    {item.employee.full_name}
                                                </button>
                                                <div className="text-[10px] font-mono text-slate-400">{item.employee.nik || item.employee.employee_code || 'Tanpa NIK'}</div>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                                                <div className="font-semibold">{typeof item.employee.department === 'object' ? item.employee.department?.name : (item.employee.department || 'Umum')}</div>
                                                <div className="text-[10px] text-slate-400">{typeof item.employee.position === 'object' ? item.employee.position?.name : (item.employee.position || '-')}</div>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => isHrOrAdmin ? handleOpenManualModal(item.employee.id, null, null, 'PRESENT') : handleOpenEmpDetail(item)}
                                                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 hover:scale-105 transition-all text-xs"
                                                    title="Klik untuk input / edit absensi Hadir"
                                                >
                                                    {item.summary?.present || 0}
                                                </button>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => isHrOrAdmin ? handleOpenManualModal(item.employee.id, null, null, 'LATE') : handleOpenEmpDetail(item)}
                                                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20 hover:scale-105 transition-all text-xs"
                                                    title="Klik untuk input / edit absensi Terlambat"
                                                >
                                                    {item.summary?.late || 0}
                                                </button>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => isHrOrAdmin ? handleOpenManualModal(item.employee.id, null, null, 'PERMIT') : handleOpenEmpDetail(item)}
                                                    className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20 hover:scale-105 transition-all text-xs"
                                                    title="Klik untuk input / edit absensi Izin/Sakit"
                                                >
                                                    {(item.summary?.permit || 0) + (item.summary?.sick || 0)}
                                                </button>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => isHrOrAdmin ? handleOpenManualModal(item.employee.id, null, null, 'LEAVE') : handleOpenEmpDetail(item)}
                                                    className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20 hover:scale-105 transition-all text-xs"
                                                    title="Klik untuk input / edit absensi Cuti"
                                                >
                                                    {item.summary?.leave || 0}
                                                </button>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => isHrOrAdmin ? handleOpenManualModal(item.employee.id, null, null, 'ABSENT') : handleOpenEmpDetail(item)}
                                                    className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20 hover:scale-105 transition-all text-xs"
                                                    title="Klik untuk input / edit absensi Alpa"
                                                >
                                                    {item.summary?.absent || 0}
                                                </button>
                                            </td>
                                            <td className="py-3.5 px-4 text-center font-extrabold font-mono text-slate-900 dark:text-slate-100">
                                                {item.summary?.total_work_hours || 0} Jam
                                            </td>
                                            {isHrOrAdmin && (
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end space-x-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenBulkModal(item)}
                                                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm flex items-center space-x-1"
                                                            title="Edit Total Rekap Bulanan Karyawan Ini"
                                                        >
                                                            <Edit3 className="w-3 h-3" />
                                                            <span>Edit Rekap</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEmpDetail(item)}
                                                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px]"
                                                            title="Lihat Detail Rincian Presensi Harian"
                                                        >
                                                            <span>Rincian</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* MATRIX CALENDAR GRID VIEW */
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-semibold">Keterangan Status Matrix:</span>
                        <div className="flex items-center space-x-3">
                            <span className="flex items-center gap-1 font-bold text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> H = Hadir</span>
                            <span className="flex items-center gap-1 font-bold text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-500"></span> T = Terlambat</span>
                            <span className="flex items-center gap-1 font-bold text-blue-600"><span className="w-2 h-2 rounded-full bg-blue-500"></span> I/S = Izin/Sakit</span>
                            <span className="flex items-center gap-1 font-bold text-purple-600"><span className="w-2 h-2 rounded-full bg-purple-500"></span> C = Cuti</span>
                            <span className="flex items-center gap-1 font-bold text-rose-600"><span className="w-2 h-2 rounded-full bg-rose-500"></span> A = Alpa</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                    <th className="py-2 px-3 sticky left-0 z-10 bg-slate-100 dark:bg-slate-900 min-w-[160px]">Nama Karyawan</th>
                                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                                        <th key={day} className="py-2 px-1 text-center min-w-[28px] border-r border-slate-200 dark:border-slate-800">
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {filteredRecap.map((item) => {
                                    if (!item || !item.employee) return null;
                                    return (
                                        <tr key={item.employee.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="py-2 px-3 sticky left-0 z-10 bg-white dark:bg-[#0f172a] shadow-sm truncate max-w-[160px]">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenEmpDetail(item)}
                                                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline text-left cursor-pointer transition-colors block truncate"
                                                    title="Klik untuk lihat detail rekap absensi karyawan ini"
                                                >
                                                    {item.employee.full_name}
                                                </button>
                                            </td>
                                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(dayNum => {
                                                const mm = String(selectedMonth).padStart(2, '0');
                                                const dd = String(dayNum).padStart(2, '0');
                                                const dateStr = `${selectedYear}-${mm}-${dd}`;
                                                const dailyRecordsObj = item.daily_records || {};
                                                const att = dailyRecordsObj[dateStr] || null;
                                                return getMatrixCell(att, item.employee.id, dayNum);
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Detail & Breakdown Absensi Karyawan */}
            {showEmpModal && selectedEmpItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                                    {selectedEmpItem.employee?.full_name?.charAt(0) || 'K'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                                        {selectedEmpItem.employee?.full_name}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        NIK: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{selectedEmpItem.employee?.nik || selectedEmpItem.employee?.employee_code || '-'}</span> • Dept: <span className="font-semibold text-slate-700 dark:text-slate-300">{typeof selectedEmpItem.employee?.department === 'object' ? selectedEmpItem.employee?.department?.name : (selectedEmpItem.employee?.department || 'Umum')}</span>
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setShowEmpModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Month Summary Stats for this Employee */}
                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">Hadir</span>
                                <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300">{selectedEmpItem.summary?.present || 0} Hari</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block">Terlambat</span>
                                <span className="text-base font-extrabold text-amber-700 dark:text-amber-300">{selectedEmpItem.summary?.late || 0} Kali</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block">Izin/Sakit</span>
                                <span className="text-base font-extrabold text-blue-700 dark:text-blue-300">{(selectedEmpItem.summary?.permit || 0) + (selectedEmpItem.summary?.sick || 0)} Hari</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 block">Cuti</span>
                                <span className="text-base font-extrabold text-purple-700 dark:text-purple-300">{selectedEmpItem.summary?.leave || 0} Hari</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block">Alpa</span>
                                <span className="text-base font-extrabold text-rose-700 dark:text-rose-300">{selectedEmpItem.summary?.absent || 0} Hari</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 col-span-2 sm:col-span-1">
                                <span className="text-[10px] font-bold text-slate-500 block">Jam Kerja</span>
                                <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-mono">{selectedEmpItem.summary?.total_work_hours || 0} Jam</span>
                            </div>
                        </div>

                        {/* List of daily attendance logs in selected month */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                                    Riwayat Presensi Harian ({monthLabel} {selectedYear})
                                </h4>
                                {isHrOrAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEmpModal(false);
                                            handleOpenManualModal(selectedEmpItem.employee?.id);
                                        }}
                                        className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] flex items-center gap-1 shadow-sm"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Input Absensi Baru</span>
                                    </button>
                                )}
                            </div>

                            {Object.keys(selectedEmpItem.daily_records || {}).length === 0 ? (
                                <div className="p-8 text-center border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/40">
                                    Belum ada catatan presensi untuk karyawan ini di bulan yang dipilih.
                                </div>
                            ) : (
                                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                                <th className="py-2.5 px-3">Tanggal</th>
                                                <th className="py-2.5 px-3">Status</th>
                                                <th className="py-2.5 px-3 font-mono">Clock In</th>
                                                <th className="py-2.5 px-3 font-mono">Clock Out</th>
                                                <th className="py-2.5 px-3 font-mono">Jam Kerja</th>
                                                <th className="py-2.5 px-3">IP &amp; Lokasi</th>
                                                <th className="py-2.5 px-3">Catatan</th>
                                                {isHrOrAdmin && <th className="py-2.5 px-3 text-right">Aksi</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                            {Object.entries(selectedEmpItem.daily_records || {})
                                                .sort(([d1], [d2]) => String(d1).localeCompare(String(d2)))
                                                .map(([dateKey, att]) => {
                                                    if (!att) return null;
                                                    return (
                                                        <tr key={att.id || dateKey} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                            <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100 font-mono">
                                                                {dateKey}
                                                            </td>
                                                            <td className="py-2.5 px-3">
                                                                {getStatusBadge(att.status)}
                                                            </td>
                                                            <td className="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                                {att.clock_in ? String(att.clock_in).substring(0, 5) : '-'}
                                                            </td>
                                                            <td className="py-2.5 px-3 font-mono font-bold text-rose-600 dark:text-rose-400">
                                                                {att.clock_out ? String(att.clock_out).substring(0, 5) : '-'}
                                                            </td>
                                                            <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                                                                {att.work_hours || 0} Jam
                                                            </td>
                                                            <td className="py-2.5 px-3 text-[10px] text-slate-500 font-mono">
                                                                {(att.clock_in_ip || att.clock_in_location) ? (
                                                                    <div className="space-y-0.5">
                                                                        {att.clock_in_ip && <div className="text-blue-600 dark:text-blue-400 flex items-center gap-1">🌐 {att.clock_in_ip}</div>}
                                                                        {att.clock_in_location && <div className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate max-w-[130px]" title={att.clock_in_location}>📍 {att.clock_in_location}</div>}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-slate-400">-</span>
                                                                )}
                                                            </td>
                                                            <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-[150px] truncate">
                                                                {att.notes || '-'}
                                                            </td>
                                                            {isHrOrAdmin && (
                                                                <td className="py-2.5 px-3 text-right space-x-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setShowEmpModal(false);
                                                                            handleOpenManualModal(selectedEmpItem.employee?.id, dateKey, att);
                                                                        }}
                                                                        className="p-1 rounded bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
                                                                        title="Edit Absensi Tanggal Ini"
                                                                    >
                                                                        <Edit3 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            handleDeleteAttendance(att.id);
                                                                        }}
                                                                        className="p-1 rounded bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                                                                        title="Hapus Absensi"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer Actions */}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <a
                                href={`/employees/${selectedEmpItem.employee?.id}`}
                                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                                <span>Lihat Profil Karyawan Lengkap →</span>
                            </a>
                            <button
                                type="button"
                                onClick={() => setShowEmpModal(false)}
                                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Input / Edit Absensi Manual HR */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <CalendarClock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <span>{editingAttendanceId ? 'Edit Absensi Karyawan (Manual HR)' : 'Input Absensi Manual Karyawan'}</span>
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitManual} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Pilih Karyawan *</label>
                                <SearchableSelect
                                    options={employees.map(e => ({
                                        value: e.id,
                                        label: `${e.full_name} (${e.nik || e.employee_code || 'Tanpa NIK'})`,
                                        sublabel: typeof e.department === 'object' ? e.department?.name : (e.department || 'Umum')
                                    }))}
                                    value={form.employee_id}
                                    onChange={(val) => setForm({ ...form, employee_id: val })}
                                    placeholder="Cari & Pilih Karyawan..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Tanggal Absensi *</label>
                                    <input
                                        type="date"
                                        required
                                        value={form.date}
                                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-bold focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Status Kehadiran *</label>
                                    <SearchableSelect
                                        options={[
                                            { value: 'PRESENT', label: 'Hadir Tepat Waktu (Present)' },
                                            { value: 'LATE', label: 'Terlambat (Late)' },
                                            { value: 'PERMIT', label: 'Izin Resmi (Permit)' },
                                            { value: 'SICK', label: 'Sakit (Sick)' },
                                            { value: 'LEAVE', label: 'Cuti (Leave)' },
                                            { value: 'ABSENT', label: 'Alpa / Tanpa Keterangan (Absent)' },
                                        ]}
                                        value={form.status}
                                        onChange={(val) => setForm({ ...form, status: val })}
                                        placeholder="Pilih Status..."
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Jam Masuk (Clock In)</label>
                                    <input
                                        type="time"
                                        value={form.clock_in}
                                        onChange={(e) => setForm({ ...form, clock_in: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono font-bold focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Jam Keluar (Clock Out)</label>
                                    <input
                                        type="time"
                                        value={form.clock_out}
                                        onChange={(e) => setForm({ ...form, clock_out: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono font-bold focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Catatan HR / Alasan Manual Adjustment</label>
                                <textarea
                                    rows="2"
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    placeholder="Alasan penyesuaian absensi manual (ex: Karyawan tidak punya akun login / penugasan lapangan)..."
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                {editingAttendanceId ? (
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteAttendance(editingAttendanceId)}
                                        className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center space-x-1 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Hapus Absensi</span>
                                    </button>
                                ) : <div />}

                                <div className="flex items-center space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
                                    >
                                        {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        <span>Simpan Absensi</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Edit Total Rekap Bulanan Karyawan */}
            {showBulkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Edit3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Edit Total Rekap Absensi Bulanan</span>
                            </h3>
                            <button onClick={() => setShowBulkModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitBulk} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Pilih Karyawan *</label>
                                <SearchableSelect
                                    options={employees.map(e => ({
                                        value: e.id,
                                        label: `${e.full_name} (${e.nik || e.employee_code || 'Tanpa NIK'})`,
                                        sublabel: typeof e.department === 'object' ? e.department?.name : (e.department || 'Umum')
                                    }))}
                                    value={bulkForm.employee_id}
                                    onChange={(empId) => {
                                        const item = (recapData || []).find(r => String(r?.employee?.id) === String(empId));
                                        const summary = item?.summary || {};
                                        setBulkForm({
                                            ...bulkForm,
                                            employee_id: empId,
                                            present_count: summary.present || 20,
                                            late_count: summary.late || 0,
                                            permit_count: (summary.permit || 0) + (summary.sick || 0),
                                            leave_count: summary.leave || 0,
                                            absent_count: summary.absent || 0,
                                        });
                                    }}
                                    placeholder="Cari & Pilih Karyawan..."
                                    required
                                />
                            </div>

                            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-600 dark:text-slate-300 font-semibold">
                                <span>Periode Rekap:</span>
                                <span className="font-bold text-slate-900 dark:text-slate-100">{monthLabel} {bulkForm.year}</span>
                            </div>

                            {/* Stat Inputs Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Total Hadir (Hari)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="31"
                                        required
                                        value={bulkForm.present_count}
                                        onChange={(e) => setBulkForm({ ...bulkForm, present_count: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-bold focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-amber-600 dark:text-amber-400 mb-1">Total Terlambat (Kali)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="31"
                                        required
                                        value={bulkForm.late_count}
                                        onChange={(e) => setBulkForm({ ...bulkForm, late_count: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-bold focus:outline-none focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-blue-600 dark:text-blue-400 mb-1">Total Izin / Sakit (Hari)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="31"
                                        required
                                        value={bulkForm.permit_count}
                                        onChange={(e) => setBulkForm({ ...bulkForm, permit_count: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-bold focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-purple-600 dark:text-purple-400 mb-1">Total Cuti (Hari)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="31"
                                        required
                                        value={bulkForm.leave_count}
                                        onChange={(e) => setBulkForm({ ...bulkForm, leave_count: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-bold focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block font-semibold text-rose-600 dark:text-rose-400 mb-1">Total Alpa / Tanpa Keterangan (Hari)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="31"
                                        required
                                        value={bulkForm.absent_count}
                                        onChange={(e) => setBulkForm({ ...bulkForm, absent_count: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-bold focus:outline-none focus:border-rose-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Catatan HR / Alasan Penyesuaian Rekap</label>
                                <textarea
                                    rows="2"
                                    value={bulkForm.notes}
                                    onChange={(e) => setBulkForm({ ...bulkForm, notes: e.target.value })}
                                    placeholder="Catatan penyesuaian rekap absensi bulanan oleh HR..."
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowBulkModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingBulk}
                                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 transition-all"
                                >
                                    {submittingBulk ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    <span>Simpan Rekap Bulanan</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
