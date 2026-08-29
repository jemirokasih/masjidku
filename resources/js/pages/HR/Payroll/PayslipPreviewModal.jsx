import React from 'react';
import { X, Download, User, Calendar, DollarSign, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function PayslipPreviewModal({ payslip, period, onClose, onDownload }) {
    if (!payslip) return null;

    const employee = payslip.employee || {};
    const att = payslip.attendance_summary || {};
    const earnings = payslip.earnings_breakdown || [];
    const deductions = payslip.deductions_breakdown || [];

    const formatRp = (num) => {
        return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
            <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
                
                {/* Header Modal */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base shadow-sm">
                            📄
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                                <span>Preview Slip Gaji</span>
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                    payslip.payment_status === 'PAID' 
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                }`}>
                                    {payslip.payment_status === 'PAID' ? 'LUNAS (PAID)' : 'BELUM DIBAYAR'}
                                </span>
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                No: <strong className="text-indigo-600 dark:text-indigo-400">{payslip.payslip_number || 'DRAFT (Belum Terbit)'}</strong> • {period?.period_name}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => onDownload && onDownload(payslip.id)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-colors"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body Preview Scrollable */}
                <div className="p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200 text-xs">
                    
                    {/* Employee Info Card */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Nama Karyawan</span>
                            <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{employee.full_name}</div>
                            <div className="text-[11px] text-slate-500">NIK: {employee.nik || employee.employee_code || '-'}</div>
                        </div>
                        <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Jabatan & Departemen</span>
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{employee.position || '-'} ({employee.department || '-'})</div>
                            <div className="text-[11px] text-slate-500">Status: {employee.employment_status || 'Karyawan'}</div>
                        </div>
                        <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Periode Penggajian</span>
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                                {period?.start_date} s/d {period?.end_date}
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Rekening Bank</span>
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                                {payslip.bank_name || employee.bank_name || '-'} • {payslip.bank_account_number || employee.bank_account_number || '-'}
                            </div>
                            <div className="text-[10px] text-slate-500">a/n {payslip.bank_account_holder || employee.bank_account_holder || employee.full_name}</div>
                        </div>
                    </div>

                    {/* Attendance Ribbon */}
                    <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                        <div className="p-1.5 rounded-lg bg-white/60 dark:bg-slate-900/60">
                            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{att.total_work_days || 0}</div>
                            <div className="text-[9px] text-slate-500 font-medium">Hari Kerja</div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-white/60 dark:bg-slate-900/60">
                            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{att.present_days || 0}</div>
                            <div className="text-[9px] text-slate-500 font-medium">Hadir Tepat</div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-white/60 dark:bg-slate-900/60">
                            <div className="text-xs font-bold text-amber-600 dark:text-amber-400">{att.late_days || 0}</div>
                            <div className="text-[9px] text-slate-500 font-medium">Terlambat</div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-white/60 dark:bg-slate-900/60">
                            <div className="text-xs font-bold text-blue-600 dark:text-blue-400">{(att.leave_days || 0) + (att.permit_days || 0) + (att.sick_days || 0)}</div>
                            <div className="text-[9px] text-slate-500 font-medium">Cuti/Izin/Sakit</div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-white/60 dark:bg-slate-900/60">
                            <div className="text-xs font-bold text-rose-600 dark:text-rose-400">{att.absent_days || 0}</div>
                            <div className="text-[9px] text-slate-500 font-medium">Alpa</div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-white/60 dark:bg-slate-900/60">
                            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{att.total_work_hours || 0} Jam</div>
                            <div className="text-[9px] text-slate-500 font-medium">Total Jam</div>
                        </div>
                    </div>

                    {/* Breakdown Earnings vs Deductions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Pendapatan (Earnings) */}
                        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 overflow-hidden bg-emerald-50/10">
                            <div className="px-3 py-2 bg-emerald-500/10 border-b border-emerald-200 dark:border-emerald-900/40 font-bold text-emerald-700 dark:text-emerald-400 text-xs flex items-center justify-between">
                                <span>PENDAPATAN (EARNINGS)</span>
                            </div>
                            <div className="p-3 space-y-2">
                                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">Gaji Pokok</span>
                                    <span className="font-bold text-slate-900 dark:text-slate-100">{formatRp(payslip.basic_salary)}</span>
                                </div>
                                {earnings.map((e, idx) => (
                                    <div key={idx} className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                                        <div>
                                            <div className="font-medium text-slate-700 dark:text-slate-300">{e.name}</div>
                                            {e.description && <div className="text-[10px] text-slate-400">{e.description}</div>}
                                        </div>
                                        <span className="font-bold text-slate-900 dark:text-slate-100">{formatRp(e.amount)}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between pt-2 font-bold text-xs text-emerald-700 dark:text-emerald-400">
                                    <span>Total Pendapatan</span>
                                    <span>{formatRp(Number(payslip.basic_salary || 0) + Number(payslip.total_allowances || 0) + Number(payslip.total_reimbursements || 0))}</span>
                                </div>
                            </div>
                        </div>

                        {/* Potongan (Deductions) */}
                        <div className="rounded-xl border border-rose-200 dark:border-rose-900/40 overflow-hidden bg-rose-50/10">
                            <div className="px-3 py-2 bg-rose-500/10 border-b border-rose-200 dark:border-rose-900/40 font-bold text-rose-700 dark:text-rose-400 text-xs flex items-center justify-between">
                                <span>POTONGAN (DEDUCTIONS)</span>
                            </div>
                            <div className="p-3 space-y-2">
                                {deductions.length > 0 ? (
                                    deductions.map((d, idx) => (
                                        <div key={idx} className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                                            <div>
                                                <div className="font-medium text-slate-700 dark:text-slate-300">{d.name}</div>
                                                {d.description && <div className="text-[10px] text-slate-400">{d.description}</div>}
                                            </div>
                                            <span className="font-bold text-rose-600 dark:text-rose-400">{formatRp(d.amount)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-4 text-center text-slate-400 text-xs italic">
                                        Tidak ada potongan pada periode ini
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 font-bold text-xs text-rose-700 dark:text-rose-400">
                                    <span>Total Potongan</span>
                                    <span>{formatRp(payslip.total_deductions)}</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Take Home Pay Callout Box */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/20 flex flex-col sm:flex-row items-center justify-between gap-2">
                        <div>
                            <span className="text-[10px] font-bold text-indigo-100 uppercase tracking-wider">GAJI BERSIH DITERIMA (TAKE HOME PAY)</span>
                            <div className="text-xs text-indigo-100 italic">Ditransfer ke {payslip.bank_name || employee.bank_name || 'Rekening'}</div>
                        </div>
                        <div className="text-xl sm:text-2xl font-black tracking-tight">
                            {formatRp(payslip.net_salary)}
                        </div>
                    </div>

                    {payslip.notes && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                            <strong>Catatan:</strong> {payslip.notes}
                        </div>
                    )}

                </div>

                {/* Footer Modal */}
                <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                    >
                        Tutup
                    </button>
                </div>

            </div>
        </div>
    );
}
