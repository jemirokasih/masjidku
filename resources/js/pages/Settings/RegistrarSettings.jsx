import React, { useState } from 'react';
import api from '../../api/axios';
import { KeyRound, Save, RefreshCw } from 'lucide-react';

const Input = ({ label, value, onChange, type = 'text', placeholder }) => (
    <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
        <input type={type} value={value || ''} onChange={onChange} placeholder={placeholder}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-blue-500" />
    </label>
);

export default function RegistrarSettings({ company, setCompany, onSave, saving }) {
    const [testing, setTesting] = useState('');
    const update = (key) => (e) => setCompany({ ...company, [key]: e.target.value });
    const test = async (provider) => {
        setTesting(provider);
        try {
            const res = await api.post(`/settings/registrars/${provider}/test`, company);
            alert(res.data.message);
        } catch (err) {
            alert(err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat()[0] || 'Tes koneksi gagal.');
        } finally { setTesting(''); }
    };

    return (
        <form onSubmit={onSave} className="space-y-7 max-w-3xl text-xs">
            <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2"><KeyRound className="w-4 h-4 text-indigo-500" />Integrasi Registrar Domain</h3>
                <p className="mt-1 text-slate-500 dark:text-slate-400">Kredensial disimpan aman. Biarkan kolom rahasia kosong bila tidak ingin mengubahnya.</p>
            </div>

            <section className="rounded-xl border border-blue-100 dark:border-blue-900/50 p-5 space-y-4 bg-blue-50/40 dark:bg-blue-950/10">
                <div><h4 className="font-bold text-slate-900 dark:text-slate-100">RDASH / Rumahweb RNA</h4><p className="text-slate-500 mt-0.5">`API Key` = Reseller ID; `API Secret` = API Key RDASH.</p></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Reseller ID" value={company.rdash_api_key} onChange={update('rdash_api_key')} placeholder="Contoh: 123" />
                    <Input label="API Key" type="password" value={company.rdash_api_secret} onChange={update('rdash_api_secret')} placeholder="Biarkan kosong untuk tetap pakai nilai lama" />
                </div>
                <Input label="Base URL" value={company.rdash_base_url} onChange={update('rdash_base_url')} placeholder="https://api.rdash.id/v1" />
                <button type="button" onClick={() => test('rdash')} disabled={!!testing} className="px-3 py-2 rounded-lg border border-blue-300 text-blue-700 dark:text-blue-300 font-bold flex gap-1.5 items-center">{testing === 'rdash' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}Tes Koneksi RDASH</button>
            </section>

            <section className="rounded-xl border border-violet-100 dark:border-violet-900/50 p-5 space-y-4 bg-violet-50/40 dark:bg-violet-950/10">
                <div><h4 className="font-bold text-slate-900 dark:text-slate-100">SRS-X</h4><p className="text-slate-500 mt-0.5">Gunakan API Username dan API Password dari akun reseller SRS-X.</p></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="API Username" value={company.srsx_user_id} onChange={update('srsx_user_id')} />
                    <Input label="API Password" type="password" value={company.srsx_api_key} onChange={update('srsx_api_key')} placeholder="Biarkan kosong untuk tetap pakai nilai lama" />
                </div>
                <Input label="Base URL" value={company.srsx_base_url} onChange={update('srsx_base_url')} placeholder="https://[reseller-url]/api" />
                <button type="button" onClick={() => test('srsx')} disabled={!!testing} className="px-3 py-2 rounded-lg border border-violet-300 text-violet-700 dark:text-violet-300 font-bold flex gap-1.5 items-center">{testing === 'srsx' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}Tes Koneksi SRS-X</button>
            </section>

            <div className="flex justify-end"><button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold flex gap-2 items-center"><Save className="w-4 h-4" />{saving ? 'Menyimpan...' : 'Simpan Konfigurasi Registrar'}</button></div>
        </form>
    );
}
