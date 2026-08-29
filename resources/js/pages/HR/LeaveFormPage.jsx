import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import SearchableSelect from '../../components/SearchableSelect';
import {
    CalendarDays,
    ArrowLeft,
    Save,
    RefreshCw,
    Calendar,
    AlertCircle,
    User,
    Info
} from 'lucide-react';

export default function LeaveFormPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const userRole = (user?.role || 'staff').toLowerCase();
    const isHrOrAdmin = ['superadmin', 'administrator', 'admin', 'hr', 'finance', 'project_manager'].includes(userRole);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [employeeProfile, setEmployeeProfile] = useState(null);

    const [form, setForm] = useState({
        employee_id: '',
        leave_type: 'ANNUAL',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        reason: '',
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [todayRes, empRes] = await Promise.all([
                    api.get('/hr/attendance/today').catch(() => null),
                    api.get('/hr/employees').catch(() => ({ data: { data: [] } })),
                ]);

                if (todayRes?.data?.data?.employee) {
                    setEmployeeProfile(todayRes.data.data.employee);
                }

                setEmployees(empRes.data.data || []);
            } catch (err) {
                console.error('Error fetching leave form initial data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Compute duration in days
    const calculateDays = () => {
        if (!form.start_date || !form.end_date) return 0;
        const start = new Date(form.start_date);
        const end = new Date(form.end_date);
        if (end < start) return 0;
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const daysCount = calculateDays();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.reason) {
            alert('Alasan pengajuan cuti wajib diisi!');
            return;
        }

        if (daysCount <= 0) {
            alert('Tanggal selesai cuti tidak boleh lebih awal dari tanggal mulai!');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/hr/leaves', form);
            alert('Permohonan cuti baru berhasil diajukan!');
            navigate('/hr/leaves');
        } catch (err) {
            alert('Gagal mengajukan cuti: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px] text-xs text-slate-500">
                <RefreshCw className="w-5 h-5 animate-spin mr-2 text-blue-600" />
                <span>Memuat formulir permohonan cuti...</span>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            {/* Header Page */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                    <button
                        type="button"
                        onClick={() => navigate('/hr/leaves')}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        title="Kembali ke Daftar Permohonan Cuti"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                            <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span>Formulir Pengajuan Cuti Baru</span>
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Isi formulir pengajuan cuti kerja karyawan &amp; ajukan langsung ke tim HR / Admin.
                        </p>
                    </div>
                </div>
            </div>

            {/* Info Banner Kuota Cuti */}
            {(() => {
                const selectedEmp = form.employee_id
                    ? employees.find(e => String(e.id) === String(form.employee_id))
                    : employeeProfile;
                if (!selectedEmp) return null;
                return (
                    <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="font-bold text-slate-900 dark:text-slate-100 block">{selectedEmp.full_name}</span>
                                <span className="text-slate-500 dark:text-slate-400">{typeof selectedEmp.department === 'object' ? selectedEmp.department?.name : (selectedEmp.department || 'Umum')}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Sisa Kuota Cuti Tahunan</span>
                            <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                                {selectedEmp.leave_balance ?? 12} Hari
                            </span>
                        </div>
                    </div>
                );
            })()}

            {/* Form Container */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5 text-xs">
                {isHrOrAdmin && (
                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Pilih Karyawan Pemohon *</label>
                        <SearchableSelect
                            options={[
                                { value: '', label: `-- Pemohon Diri Sendiri (${employeeProfile?.full_name || 'Saya'}) --` },
                                ...employees.map(e => ({
                                    value: e.id,
                                    label: e.full_name,
                                    code: e.nik || e.employee_code,
                                    sublabel: typeof e.department === 'object' ? e.department?.name : (e.department || 'Umum'),
                                }))
                            ]}
                            value={form.employee_id}
                            onChange={(val) => setForm({ ...form, employee_id: val })}
                            placeholder="Cari & Pilih Karyawan Pemohon..."
                        />
                    </div>
                )}

                <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Jenis Cuti Kerja *</label>
                    <SearchableSelect
                        options={[
                            { value: 'ANNUAL', label: '🏝️ Cuti Tahunan (Annual Leave)' },
                            { value: 'SICK', label: '🤒 Cuti Sakit (Sick Leave)' },
                            { value: 'MATERNITY', label: '🤰 Cuti Melahirkan (Maternity Leave)' },
                            { value: 'MARRIAGE', label: '💒 Cuti Menikah (Marriage Leave)' },
                            { value: 'SPECIAL', label: '🌟 Izin Khusus (Special Leave)' },
                            { value: 'UNPAID', label: '📜 Cuti Tanpa Gaji (Unpaid Leave)' },
                        ]}
                        value={form.leave_type}
                        onChange={(val) => setForm({ ...form, leave_type: val })}
                        placeholder="Cari & Pilih Jenis Cuti..."
                        required
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Tanggal Mulai Cuti *</label>
                        <input
                            type="date"
                            required
                            value={form.start_date}
                            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Tanggal Selesai Cuti *</label>
                        <input
                            type="date"
                            required
                            value={form.end_date}
                            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
                        />
                    </div>
                </div>

                {/* Calculation Summary Box */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">Total Durasi Hari Cuti Diajukan:</span>
                    <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                        {daysCount} Hari Kerja
                    </span>
                </div>

                <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Alasan &amp; Keterangan Pengajuan Cuti *</label>
                    <textarea
                        rows={4}
                        required
                        value={form.reason}
                        onChange={(e) => setForm({ ...form, reason: e.target.value })}
                        placeholder="Jelaskan alasan keperluan cuti kerja secara lengkap..."
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                </div>

                {/* Form Actions */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => navigate('/hr/leaves')}
                        className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 transition-all"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={submitting || daysCount <= 0}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
                    >
                        {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>Kirim Permohonan Cuti</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
