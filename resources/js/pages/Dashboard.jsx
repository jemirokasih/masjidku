import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    DollarSign,
    FileText,
    Users,
    Clock,
    Plus,
    TrendingUp,
    ChevronRight,
    CheckCircle2,
    RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const [stats, setStats] = useState({
        revenue: 0,
        pendingAmount: 0,
        clientCount: 0,
        invoiceCount: 0,
        invoices: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [invRes, clientRes] = await Promise.all([
                    api.get('/invoices'),
                    api.get('/clients')
                ]);
                const invoices = invRes.data.data || [];
                const clients = clientRes.data.data || [];

                const totalRev = invoices
                    .filter(i => i.status === 'PAID')
                    .reduce((sum, i) => sum + (parseFloat(i.grand_total) || 0), 0);

                const pending = invoices
                    .filter(i => i.status !== 'PAID')
                    .reduce((sum, i) => sum + (parseFloat(i.grand_total) || 0), 0);

                setStats({
                    revenue: totalRev,
                    pendingAmount: pending,
                    clientCount: clients.length,
                    invoiceCount: invoices.length,
                    invoices: invoices.slice(0, 5),
                });
            } catch (err) {
                console.error('Error loading dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const kpiCards = [
        {
            title: 'TOTAL PENDAPATAN',
            value: `Rp ${new Intl.NumberFormat('id-ID').format(stats.revenue)}`,
            subtext: '+12.5% dibanding bulan lalu',
            icon: DollarSign,
            accent: 'border-l-4 border-l-emerald-500',
        },
        {
            title: 'TAGIHAN UNPAID / PENDING',
            value: `Rp ${new Intl.NumberFormat('id-ID').format(stats.pendingAmount)}`,
            subtext: 'Membutuhkan tindak lanjut',
            icon: Clock,
            accent: 'border-l-4 border-l-amber-500',
        },
        {
            title: 'KLIEN TERDAFTAR',
            value: `${stats.clientCount} Perusahaan`,
            subtext: 'CRM Klien Aktif',
            icon: Users,
            accent: 'border-l-4 border-l-blue-500',
        },
        {
            title: 'TOTAL INVOICE TERBIT',
            value: `${stats.invoiceCount} Document`,
            subtext: 'Siap Cetak / Portal',
            icon: FileText,
            accent: 'border-l-4 border-l-purple-500',
        },
    ];

    const statusPills = {
        PAID: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        SENT: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        DRAFT: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
        OVERDUE: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    };

    return (
        <div className="space-y-6">
            {/* Header Title Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                        <span>Ringkasan Operasional & Keuangan</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Mikrotek Business Suite Neo — Multi-Module Enterprise Platform
                    </p>
                </div>

                <div className="flex items-center space-x-2.5">
                    <Link
                        to="/invoices"
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Buat Invoice</span>
                    </Link>
                    <Link
                        to="/clients"
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center space-x-1.5 transition-all"
                    >
                        <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span>Tambah Klien</span>
                    </Link>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((kpi, idx) => {
                    const Icon = kpi.icon;
                    return (
                        <div
                            key={idx}
                            className={`bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all ${kpi.accent}`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                                    {kpi.title}
                                </span>
                                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                                    <Icon className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono tracking-tight">
                                    {kpi.value}
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                                    <span>{kpi.subtext}</span>
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Grid: Recent Invoices & System Health */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Invoices Table */}
                <div className="lg:col-span-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Daftar Tagihan Invoice Terkini</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Transaksi pembuatan & status pelunasan invoice.</p>
                        </div>
                        <Link to="/invoices" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1">
                            <span>Lihat Semua</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-8 text-xs text-slate-500 dark:text-slate-400">
                            <RefreshCw className="w-4 h-4 animate-spin mr-2 text-blue-600 dark:text-blue-400" />
                            <span>Memuat data invoice...</span>
                        </div>
                    ) : stats.invoices.length === 0 ? (
                        <div className="p-8 text-center border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500">
                            Belum ada transaksi invoice terdaftar.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                        <th className="py-3 px-4">No. Invoice</th>
                                        <th className="py-3 px-4">Klien</th>
                                        <th className="py-3 px-4">Tanggal</th>
                                        <th className="py-3 px-4">Total Tagihan</th>
                                        <th className="py-3 px-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                    {stats.invoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{inv.invoice_number}</td>
                                            <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{inv.client?.company_name || inv.client?.name}</td>
                                            <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{inv.invoice_date}</td>
                                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100 font-mono">
                                                Rp {new Intl.NumberFormat('id-ID').format(inv.grand_total)}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${statusPills[inv.status] || statusPills.SENT}`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* System Status & Architecture Summary */}
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                    <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Status Server & Database Engine</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Kompatibilitas infrastruktur MySQL & Shared Hosting.</p>
                    </div>

                    <div className="space-y-3">
                        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Database Engine</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">MariaDB / MySQL (`mikrotek_neo`)</p>
                                </div>
                            </div>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20">Active</span>
                        </div>

                        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">PDF Generator Engine</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Dompdf PHP (No Node/Chrome required)</p>
                                </div>
                            </div>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20">cPanel Ready</span>
                        </div>

                        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">API Architecture</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">RESTful JSON + Laravel Sanctum</p>
                                </div>
                            </div>
                            <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded border border-blue-500/20">v1.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
