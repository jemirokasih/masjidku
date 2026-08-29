import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { terbilang } from '../../utils/terbilang';
import { Sparkles, Printer, FileText, Building, CheckCircle2, Clock, Calendar } from 'lucide-react';


export default function InvoicePortal() {
    const { token, number } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const invoiceIdentifier = token || number;

    useEffect(() => {
        const fetchInvoice = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/api/v1/portal/invoices/${invoiceIdentifier}`);
                setData(res.data.data);
            } catch (err) {
                setError('Invoice tidak ditemukan atau tautan akses tidak valid.');
            } finally {
                setLoading(false);
            }
        };

        if (invoiceIdentifier) {
            fetchInvoice();
        }
    }, [invoiceIdentifier]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#070a12] flex items-center justify-center text-gray-400 text-xs font-sans">
                <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                    <span>Memuat Portal Invoice Mikrotek...</span>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-[#070a12] flex items-center justify-center p-4 font-sans text-gray-300">
                <div className="max-w-md w-full p-8 rounded-2xl bg-[#0f172a] border border-gray-800 text-center space-y-4 shadow-2xl">
                    <FileText className="w-12 h-12 text-rose-400 mx-auto" />
                    <h2 className="text-lg font-bold text-white">Invoice Tidak Ditemukan</h2>
                    <p className="text-xs text-gray-400">{error || 'Tautan invoice yang Anda tuju tidak valid atau tidak ada dalam sistem.'}</p>
                </div>
            </div>
        );
    }

    const { invoice, company } = data;

    return (
        <div className="min-h-screen bg-[#070a12] text-gray-100 p-4 md:p-12 font-sans selection:bg-indigo-500 selection:text-white">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header Brand Bar */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0f172a]/90 border border-gray-800 shadow-xl">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20">
                            <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-indigo-400" />
                            </div>
                        </div>
                        <div>
                            <h1 className="font-extrabold text-base text-white tracking-tight">PORTAL KLIEN MIKROTEK</h1>
                            <p className="text-[11px] text-gray-400">Unduh & Cetak Invoice Resmi Perusahaan</p>
                        </div>
                    </div>

                    <a
                        href={`/api/v1/portal/invoices/${invoice.public_token || invoice.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all transform active:scale-95"
                    >
                        <Printer className="w-4 h-4" />
                        <span>Unduh File PDF</span>
                    </a>
                </div>

                {/* Main Invoice Sheet */}
                <div className="bg-[#0f172a]/90 border border-gray-800 rounded-2xl p-6 md:p-10 shadow-2xl space-y-8">
                    {/* Invoice Meta Header */}
                    <div className="flex flex-col md:flex-row justify-between border-b border-gray-800 pb-6 gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-indigo-400">{company.company_name}</h2>
                            <p className="text-xs text-gray-400 mt-1 max-w-sm">{company.company_address}</p>
                            <p className="text-xs text-gray-400">Email: {company.company_email} | Telp: {company.company_phone}</p>
                        </div>

                        <div className="text-left md:text-right">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">TAGIHAN INVOICE</span>
                            <h3 className="text-2xl font-black text-white font-mono mt-1">{invoice.invoice_number}</h3>
                            <div className="mt-2">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-black border ${
                                    invoice.status === 'PAID'
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                }`}>
                                    STATUS: {invoice.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Client & Dates Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                        <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">DITUJUKAN KEPADA:</span>
                            <p className="font-extrabold text-sm text-gray-100">{invoice.client?.company_name || invoice.client?.name}</p>
                            <p className="text-gray-400">Up: {invoice.client?.name}</p>
                            <p className="text-gray-400">{invoice.client?.address}</p>
                        </div>

                        <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2 text-right">
                            {invoice.reference_number && (
                                <div>
                                    <span className="text-gray-400">No. Ref / PO: </span>
                                    <strong className="text-amber-400 font-mono">{invoice.reference_number}</strong>
                                </div>
                            )}
                            <div>
                                <span className="text-gray-400">Tanggal Terbit: </span>
                                <strong className="text-gray-200">{invoice.invoice_date}</strong>
                            </div>
                            <div>
                                <span className="text-gray-400">Jatuh Tempo: </span>
                                <strong className="text-indigo-400">{invoice.due_date}</strong>
                            </div>
                        </div>

                    </div>

                    {/* Items Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-gray-800 text-[11px] font-bold text-gray-400 uppercase bg-gray-900/50">
                                    <th className="py-3 px-4">Deskripsi Layanan / Produk</th>
                                    <th className="py-3 px-4 text-right">Qty</th>
                                    <th className="py-3 px-4 text-right">Harga (@)</th>
                                    <th className="py-3 px-4 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/60">
                                {invoice.items?.map((item) => (
                                    <tr key={item.id}>
                                        <td className="py-4 px-4">
                                            <p className="font-bold text-gray-200">{item.item_name}</p>
                                            {item.description && <p className="text-[11px] text-gray-400">{item.description}</p>}
                                        </td>
                                        <td className="py-4 px-4 text-right font-semibold text-gray-300">{item.quantity}</td>
                                        <td className="py-4 px-4 text-right font-semibold text-gray-300">
                                            Rp {new Intl.NumberFormat('id-ID').format(item.unit_price)}
                                        </td>
                                        <td className="py-4 px-4 text-right font-bold text-gray-100">
                                            Rp {new Intl.NumberFormat('id-ID').format(item.subtotal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Summary */}
                    <div className="p-5 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2 text-right text-xs max-w-sm ml-auto">
                        <div className="flex justify-between text-gray-400">
                            <span>Subtotal:</span>
                            <span className="font-bold text-gray-200">Rp {new Intl.NumberFormat('id-ID').format(invoice.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                            <span>PPN ({invoice.tax_rate}%):</span>
                            <span className="font-bold text-gray-200">Rp {new Intl.NumberFormat('id-ID').format(invoice.tax_amount)}</span>
                        </div>
                        <div className="flex justify-between text-indigo-400 font-extrabold text-base pt-2 border-t border-gray-800">
                            <span>GRAND TOTAL:</span>
                            <span>Rp {new Intl.NumberFormat('id-ID').format(invoice.grand_total)}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 italic text-[11px]">
                            <span className="font-bold not-italic">Terbilang: </span>
                            <span>{terbilang(invoice.grand_total)}</span>
                        </div>
                    </div>


                    {/* Bank Transfer Instructions */}
                    {data.bank_accounts && data.bank_accounts.length > 0 ? (
                        <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-2 text-xs">
                            <h4 className="font-bold text-blue-300 uppercase tracking-wider text-[11px]">Instruksi Transfer Rekening Bank Perusahaan:</h4>
                            <div className="space-y-1.5 font-mono text-[11px] text-gray-200">
                                {data.bank_accounts.map((acc, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                                        <div>
                                            <span className="font-bold text-blue-400">{acc.bank_name}</span>: {acc.account_number} (a/n {acc.account_holder})
                                            {acc.branch && <span className="text-gray-400 text-[10px]"> &bull; {acc.branch}</span>}
                                        </div>
                                        {acc.is_primary && (
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0 w-max mt-1 sm:mt-0">
                                                REKENING UTAMA
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        company.bank_details && (
                            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-1 text-xs">
                                <h4 className="font-bold text-indigo-300 uppercase tracking-wider text-[11px]">Instruksi Transfer Rekening Bank:</h4>
                                <p className="text-gray-300 whitespace-pre-line font-mono text-[11px]">{company.bank_details}</p>
                            </div>
                        )
                    )}

                </div>
            </div>
        </div>
    );
}
