import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import SearchableSelect from '../../components/SearchableSelect';
import {
    Users,
    ArrowLeft,
    Save,
    RefreshCw,
    User,
    Briefcase,
    CreditCard,
    Building2,
    Plus,
    Trash2,
    Banknote
} from 'lucide-react';

export default function EmployeeFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);

    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [employmentStatuses, setEmploymentStatuses] = useState([]);

    const [formTab, setFormTab] = useState('personal'); // 'personal' | 'employment' | 'bank'

    const [form, setForm] = useState({
        full_name: '',
        nik: '',
        gender: 'MALE',
        birth_date: '',
        email: '',
        phone: '',
        address: '',
        position: 'Software Engineer',
        department: 'Teknologi Informasi',
        employment_status: 'PERMANENT',
        join_date: new Date().toISOString().split('T')[0],
        salary: '',
        leave_balance: 12,
        bank_name: 'Bank BCA',
        bank_account_number: '',
        bank_account_holder: '',
        salary_components: [
            { name: 'Uang Makan Harian', component_type: 'ALLOWANCE', calculation_type: 'DAILY_ATTENDANCE', amount: 50000, is_active: true },
            { name: 'Tunjangan Transport', component_type: 'ALLOWANCE', calculation_type: 'DAILY_ATTENDANCE', amount: 25000, is_active: true },
            { name: 'BPJS Ketenagakerjaan', component_type: 'DEDUCTION', calculation_type: 'PERCENTAGE', amount: 2, is_active: true }
        ],
    });

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [deptRes, posRes, statusRes] = await Promise.all([
                    api.get('/hr/departments').catch(() => ({ data: { data: [] } })),
                    api.get('/hr/positions').catch(() => ({ data: { data: [] } })),
                    api.get('/hr/employment-statuses').catch(() => ({ data: { data: [] } })),
                ]);
                const depts = deptRes.data.data || [];
                const pos = posRes.data.data || [];
                const statuses = statusRes.data.data || [];

                setDepartments(depts);
                setPositions(pos);
                setEmploymentStatuses(statuses);

                if (!isEdit) {
                    setForm(prev => ({
                        ...prev,
                        position: pos[0]?.name || 'Software Engineer',
                        department: depts[0]?.name || 'Teknologi Informasi',
                        employment_status: statuses[0]?.code || 'PERMANENT',
                    }));
                } else {
                    const empRes = await api.get(`/hr/employees/${id}`);
                    const emp = empRes.data.data;
                    if (emp) {
                        setForm({
                            full_name: emp.full_name || '',
                            nik: emp.nik || '',
                            gender: emp.gender || 'MALE',
                            birth_date: emp.birth_date || '',
                            email: emp.email || '',
                            phone: emp.phone || '',
                            address: emp.address || '',
                            position: emp.position || (pos[0]?.name || 'Software Engineer'),
                            department: emp.department || (depts[0]?.name || 'Teknologi Informasi'),
                            employment_status: emp.employment_status || (statuses[0]?.code || 'PERMANENT'),
                            join_date: emp.join_date || '',
                            salary: emp.salary !== undefined && emp.salary !== null ? Math.round(emp.salary) : '',
                            leave_balance: emp.leave_balance ?? 12,
                            bank_name: emp.bank_name || 'Bank BCA',
                            bank_account_number: emp.bank_account_number || '',
                            bank_account_holder: emp.bank_account_holder || '',
                            salary_components: (emp.salary_components || []).map(c => ({
                                name: c.name,
                                component_type: c.component_type,
                                calculation_type: c.calculation_type,
                                amount: c.amount,
                                is_active: c.is_active,
                            })),
                        });
                    }
                }
            } catch (err) {
                console.error('Error fetching employee form data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMasterData();
    }, [id, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.full_name) {
            alert('Nama lengkap karyawan wajib diisi!');
            return;
        }

        setSubmitting(true);
        try {
            if (isEdit) {
                await api.put(`/hr/employees/${id}`, form);
                alert('Data karyawan berhasil diperbarui!');
            } else {
                await api.post('/hr/employees', form);
                alert('Data karyawan baru berhasil disimpan!');
            }
            navigate('/employees');
        } catch (err) {
            alert('Gagal menyimpan data karyawan: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px] text-xs text-slate-500">
                <RefreshCw className="w-5 h-5 animate-spin mr-2 text-blue-600" />
                <span>Memuat data karyawan...</span>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            {/* Page Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                    <button
                        type="button"
                        onClick={() => navigate('/employees')}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        title="Kembali ke Daftar Karyawan"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span>{isEdit ? 'Edit Data Karyawan' : 'Formulir Tambah Karyawan Baru'}</span>
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Kelola profil lengkap karyawan, informasi kepegawaian, serta akun penggajian bank.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Container */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 text-xs">
                {/* Navigation Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4">
                    <button
                        type="button"
                        onClick={() => setFormTab('personal')}
                        className={`pb-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-all ${
                            formTab === 'personal'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                    >
                        <User className="w-4 h-4" />
                        <span>1. Data Pribadi</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormTab('employment')}
                        className={`pb-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-all ${
                            formTab === 'employment'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                    >
                        <Briefcase className="w-4 h-4" />
                        <span>2. Kepegawaian &amp; Jabatan</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormTab('bank')}
                        className={`pb-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-all ${
                            formTab === 'bank'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                    >
                        <CreditCard className="w-4 h-4" />
                        <span>3. Gaji Pokok &amp; Rekening Bank Payroll</span>
                    </button>
                </div>

                {/* TAB 1: DATA PRIBADI */}
                {formTab === 'personal' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap Karyawan *</label>
                            <input
                                type="text"
                                required
                                value={form.full_name}
                                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                placeholder="Contoh: Budi Pratama, S.Kom"
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor Induk Karyawan (NIK)</label>
                                <input
                                    type="text"
                                    value={form.nik}
                                    onChange={(e) => setForm({ ...form, nik: e.target.value })}
                                    placeholder="Auto / Isi NIK Karyawan"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jenis Kelamin</label>
                                <SearchableSelect
                                    options={[
                                        { value: 'MALE', label: 'Laki-Laki (Male)' },
                                        { value: 'FEMALE', label: 'Perempuan (Female)' },
                                    ]}
                                    value={form.gender}
                                    onChange={(val) => setForm({ ...form, gender: val })}
                                    placeholder="Pilih Jenis Kelamin..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Karyawan</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="karyawan@perusahaan.com"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor Telepon / WA</label>
                                <input
                                    type="text"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="081234567890"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Tempat Tinggal</label>
                            <textarea
                                rows={2}
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                placeholder="Alamat lengkap domisili karyawan..."
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                )}

                {/* TAB 2: KEPEGAWAIAN */}
                {formTab === 'employment' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Departemen *</label>
                                <SearchableSelect
                                    options={departments.map(d => ({ value: d.name, label: d.name }))}
                                    value={form.department}
                                    onChange={(val) => {
                                        const selectedDept = departments.find(d => d.name === val);
                                        const filteredPos = selectedDept
                                            ? positions.filter(p => p.department_id === selectedDept.id)
                                            : [];
                                        setForm({
                                            ...form,
                                            department: val,
                                            position: filteredPos[0]?.name || ''
                                        });
                                    }}
                                    placeholder="Cari & Pilih Departemen..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jabatan *</label>
                                <SearchableSelect
                                    options={
                                        (() => {
                                            const activeDept = departments.find(d => d.name === form.department);
                                            const filtered = activeDept
                                                ? positions.filter(p => p.department_id === activeDept.id)
                                                : positions;
                                            return filtered.map(p => ({ value: p.name, label: p.name }));
                                        })()
                                    }
                                    value={form.position}
                                    onChange={(val) => setForm({ ...form, position: val })}
                                    placeholder="Cari & Pilih Jabatan..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status Kepegawaian *</label>
                                <SearchableSelect
                                    options={employmentStatuses.map(s => ({ value: s.code, label: s.name }))}
                                    value={form.employment_status}
                                    onChange={(val) => setForm({ ...form, employment_status: val })}
                                    placeholder="Cari & Pilih Status Kepegawaian..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal Mulai Bekerja (Join Date)</label>
                                <input
                                    type="date"
                                    value={form.join_date}
                                    onChange={(e) => setForm({ ...form, join_date: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kuota Cuti Tahunan (Hari)</label>
                            <input
                                type="number"
                                min="0"
                                max="365"
                                value={form.leave_balance}
                                onChange={(e) => setForm({ ...form, leave_balance: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                )}

                {/* TAB 3: GAJI POKOK, TUNJANGAN & REKENING BANK */}
                {formTab === 'bank' && (
                    <div className="space-y-6">
                        {/* SECTION A: PENDAPATAN & GAJI POKOK */}
                        <div className="p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 space-y-4">
                            <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-900/40 pb-3">
                                <div className="flex items-center space-x-2">
                                    <div className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-sm">
                                        <Banknote className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">1. Pendapatan &amp; Gaji Pokok Karyawan (Earnings &amp; Allowances)</h4>
                                        <p className="text-[11px] text-slate-500">Gaji pokok, tunjangan tetap bulanan, uang makan harian, dan transport.</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setForm(prev => ({
                                            ...prev,
                                            salary_components: [
                                                ...(prev.salary_components || []),
                                                { name: 'Tunjangan Baru', component_type: 'ALLOWANCE', calculation_type: 'FIXED', amount: 500000, is_active: true }
                                            ]
                                        }));
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm flex items-center space-x-1 transition-all"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>+ Tambah Tunjangan</span>
                                </button>
                            </div>

                            {/* Gaji Pokok Input */}
                            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 shadow-sm space-y-1">
                                <label className="block font-bold text-emerald-900 dark:text-emerald-300 text-xs">
                                    💵 Gaji Pokok Utama Karyawan (Base Salary - Rp) *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    placeholder="Contoh: 7500000"
                                    value={form.salary}
                                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                                    className="w-full px-3.5 py-2 bg-emerald-50/30 dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700 rounded-xl text-slate-900 dark:text-slate-100 font-mono font-extrabold text-sm focus:outline-none focus:border-emerald-500"
                                />
                                <p className="text-[10px] text-slate-500">Nilai Gaji Pokok utama yang menjadi acuan perhitungan penggajian bulanan.</p>
                            </div>

                                {/* Preset Buttons Allowance */}
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">Preset Cepat:</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!(form.salary_components || []).some(c => c.name === 'Uang Makan Harian')) {
                                                setForm(prev => ({
                                                    ...prev,
                                                    salary_components: [...(prev.salary_components || []), { name: 'Uang Makan Harian', component_type: 'ALLOWANCE', calculation_type: 'DAILY_ATTENDANCE', amount: 50000, is_active: true }]
                                                }));
                                            }
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100"
                                    >
                                        + Uang Makan Harian (Rp 50.000/hari)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!(form.salary_components || []).some(c => c.name === 'Tunjangan Transport')) {
                                                setForm(prev => ({
                                                    ...prev,
                                                    salary_components: [...(prev.salary_components || []), { name: 'Tunjangan Transport', component_type: 'ALLOWANCE', calculation_type: 'DAILY_ATTENDANCE', amount: 25000, is_active: true }]
                                                }));
                                            }
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100"
                                    >
                                        + Tunjangan Transport (Rp 25.000/hari)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!(form.salary_components || []).some(c => c.name === 'Tunjangan Jabatan')) {
                                                setForm(prev => ({
                                                    ...prev,
                                                    salary_components: [...(prev.salary_components || []), { name: 'Tunjangan Jabatan', component_type: 'ALLOWANCE', calculation_type: 'FIXED', amount: 1500000, is_active: true }]
                                                }));
                                            }
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100"
                                    >
                                        + Tunjangan Jabatan (Fixed)
                                    </button>
                                </div>

                                {/* List Allowances */}
                                <div className="space-y-2 pt-1">
                                    {(form.salary_components || []).filter(c => c.component_type === 'ALLOWANCE').map((comp, idx) => {
                                        const globalIdx = form.salary_components.findIndex(item => item === comp);
                                        return (
                                            <div key={globalIdx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/60 dark:border-emerald-900/40">
                                                <div className="sm:col-span-4">
                                                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Nama Tunjangan</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="e.g. Uang Makan Harian"
                                                        value={comp.name}
                                                        onChange={(e) => {
                                                            const updated = [...form.salary_components];
                                                            updated[globalIdx].name = e.target.value;
                                                            setForm({ ...form, salary_components: updated });
                                                        }}
                                                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-xs"
                                                    />
                                                </div>

                                                <div className="sm:col-span-4">
                                                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Metode Perhitungan</label>
                                                    <SearchableSelect
                                                        options={[
                                                            { value: 'DAILY_ATTENDANCE', label: 'Harian x Presensi (Daily)' },
                                                            { value: 'FIXED', label: 'Nominal Tetap Bulanan (Fixed)' },
                                                            { value: 'PERCENTAGE', label: '% dari Gaji Pokok' },
                                                        ]}
                                                        value={comp.calculation_type}
                                                        onChange={(val) => {
                                                            const updated = [...form.salary_components];
                                                            updated[globalIdx].calculation_type = val;
                                                            setForm({ ...form, salary_components: updated });
                                                        }}
                                                        placeholder="Metode Perhitungan..."
                                                    />
                                                </div>

                                                <div className="sm:col-span-3">
                                                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Nominal (Rp / %)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="any"
                                                        required
                                                        placeholder="Nominal / Nilai"
                                                        value={comp.amount}
                                                        onChange={(e) => {
                                                            const updated = [...form.salary_components];
                                                            updated[globalIdx].amount = parseFloat(e.target.value) || 0;
                                                            setForm({ ...form, salary_components: updated });
                                                        }}
                                                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-xs"
                                                    />
                                                </div>

                                                <div className="sm:col-span-1 text-right pt-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const updated = form.salary_components.filter((_, i) => i !== globalIdx);
                                                            setForm({ ...form, salary_components: updated });
                                                        }}
                                                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                                                        title="Hapus Tunjangan"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* SECTION C: POTONGAN RUTIN */}
                            <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-800/40 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="p-1.5 rounded-lg bg-rose-500 text-white shadow-sm">
                                            <Banknote className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">2. Potongan Rutin &amp; Asuransi (Deductions)</h4>
                                            <p className="text-[11px] text-slate-500">BPJS Ketenagakerjaan, BPJS Kesehatan, kasbon, dan cicilan.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setForm(prev => ({
                                                ...prev,
                                                salary_components: [
                                                    ...(prev.salary_components || []),
                                                    { name: 'Potongan BPJS', component_type: 'DEDUCTION', calculation_type: 'PERCENTAGE', amount: 2, is_active: true }
                                                ]
                                            }));
                                        }}
                                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] shadow-sm flex items-center space-x-1 transition-all"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>+ Tambah Potongan</span>
                                    </button>
                                </div>

                                {/* Preset Buttons Deductions */}
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    <span className="text-[11px] text-rose-700 dark:text-rose-400 font-bold">Preset Cepat:</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!(form.salary_components || []).some(c => c.name === 'BPJS Ketenagakerjaan')) {
                                                setForm(prev => ({
                                                    ...prev,
                                                    salary_components: [...(prev.salary_components || []), { name: 'BPJS Ketenagakerjaan', component_type: 'DEDUCTION', calculation_type: 'PERCENTAGE', amount: 2, is_active: true }]
                                                }));
                                            }
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 text-[10px] font-bold border border-rose-300 dark:border-rose-700 hover:bg-rose-100"
                                    >
                                        + BPJS TK (2%)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!(form.salary_components || []).some(c => c.name === 'BPJS Kesehatan')) {
                                                setForm(prev => ({
                                                    ...prev,
                                                    salary_components: [...(prev.salary_components || []), { name: 'BPJS Kesehatan', component_type: 'DEDUCTION', calculation_type: 'PERCENTAGE', amount: 1, is_active: true }]
                                                }));
                                            }
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 text-[10px] font-bold border border-rose-300 dark:border-rose-700 hover:bg-rose-100"
                                    >
                                        + BPJS Kesehatan (1%)
                                    </button>
                                </div>

                                {/* List Deductions */}
                                <div className="space-y-2 pt-1">
                                    {(form.salary_components || []).filter(c => c.component_type === 'DEDUCTION').map((comp, idx) => {
                                        const globalIdx = form.salary_components.findIndex(item => item === comp);
                                        return (
                                            <div key={globalIdx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200/60 dark:border-rose-900/40">
                                                <div className="sm:col-span-4">
                                                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Nama Potongan</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="e.g. BPJS Ketenagakerjaan"
                                                        value={comp.name}
                                                        onChange={(e) => {
                                                            const updated = [...form.salary_components];
                                                            updated[globalIdx].name = e.target.value;
                                                            setForm({ ...form, salary_components: updated });
                                                        }}
                                                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-xs"
                                                    />
                                                </div>

                                                <div className="sm:col-span-4">
                                                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Metode Perhitungan</label>
                                                    <SearchableSelect
                                                        options={[
                                                            { value: 'PERCENTAGE', label: '% dari Gaji Pokok' },
                                                            { value: 'FIXED', label: 'Nominal Tetap Bulanan (Fixed)' },
                                                        ]}
                                                        value={comp.calculation_type}
                                                        onChange={(val) => {
                                                            const updated = [...form.salary_components];
                                                            updated[globalIdx].calculation_type = val;
                                                            setForm({ ...form, salary_components: updated });
                                                        }}
                                                        placeholder="Metode Perhitungan..."
                                                    />
                                                </div>

                                                <div className="sm:col-span-3">
                                                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Nilai (% / Rp)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="any"
                                                        required
                                                        placeholder="Nilai"
                                                        value={comp.amount}
                                                        onChange={(e) => {
                                                            const updated = [...form.salary_components];
                                                            updated[globalIdx].amount = parseFloat(e.target.value) || 0;
                                                            setForm({ ...form, salary_components: updated });
                                                        }}
                                                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-xs"
                                                    />
                                                </div>

                                                <div className="sm:col-span-1 text-right pt-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const updated = form.salary_components.filter((_, i) => i !== globalIdx);
                                                            setForm({ ...form, salary_components: updated });
                                                        }}
                                                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                                                        title="Hapus Potongan"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* SECTION C: REKENING BANK PAYROLL */}
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                                <div className="flex items-center space-x-2">
                                    <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-sm">
                                        <CreditCard className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">3. Rekening Bank Transfer Payroll</h4>
                                        <p className="text-[11px] text-slate-500">Informasi nomor rekening bank untuk pencairan &amp; transfer slip gaji.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Bank</label>
                                        <SearchableSelect
                                            options={[
                                                { value: 'Bank BCA', label: 'Bank BCA' },
                                                { value: 'Bank Mandiri', label: 'Bank Mandiri' },
                                                { value: 'Bank BNI', label: 'Bank BNI' },
                                                { value: 'Bank BRI', label: 'Bank BRI' },
                                                { value: 'Bank CIMB Niaga', label: 'Bank CIMB Niaga' },
                                                { value: 'Bank Permata', label: 'Bank Permata' },
                                                { value: 'Bank Danamon', label: 'Bank Danamon' },
                                                { value: 'Lainnya', label: 'Lainnya' },
                                            ]}
                                            value={form.bank_name}
                                            onChange={(val) => setForm({ ...form, bank_name: val })}
                                            placeholder="Pilih Bank..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor Rekening</label>
                                        <input
                                            type="text"
                                            value={form.bank_account_number}
                                            onChange={(e) => setForm({ ...form, bank_account_number: e.target.value })}
                                            placeholder="1234567890"
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-mono font-bold text-xs focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Pemilik Rekening</label>
                                        <input
                                            type="text"
                                            value={form.bank_account_holder}
                                            onChange={(e) => setForm({ ...form, bank_account_holder: e.target.value })}
                                            placeholder="Sesuai nama di buku tabungan..."
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold text-xs focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                )}

                {/* Form Actions */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex space-x-2">
                        {formTab !== 'personal' && (
                            <button
                                type="button"
                                onClick={() => setFormTab(formTab === 'bank' ? 'employment' : 'personal')}
                                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 transition-all"
                            >
                                Sebelumnya
                            </button>
                        )}
                        {formTab !== 'bank' && (
                            <button
                                type="button"
                                onClick={() => setFormTab(formTab === 'personal' ? 'employment' : 'bank')}
                                className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 transition-all"
                            >
                                Selanjutnya
                            </button>
                        )}
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate('/employees')}
                            className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 transition-all"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
                        >
                            {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            <span>{isEdit ? 'Simpan Perubahan' : 'Simpan Karyawan'}</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
