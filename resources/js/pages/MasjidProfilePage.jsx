import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Building, Save, RefreshCw, CheckCircle2, MapPin, Phone, Mail, CreditCard } from 'lucide-react';

export default function MasjidProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        phone: '',
        email: '',
        description: '',
        vision: '',
        mission: '',
        bank_accounts: '',
    });

    useEffect(() => {
        const fetchMasjid = async () => {
            setLoading(true);
            try {
                const res = await api.get('/tenant/masjid');
                const m = res.data.data;
                setFormData({
                    name: m.name || '',
                    slug: m.slug || '',
                    address: m.address || '',
                    city: m.city || '',
                    province: m.province || '',
                    postal_code: m.postal_code || '',
                    phone: m.phone || '',
                    email: m.email || '',
                    description: m.info?.description || '',
                    vision: m.info?.vision || '',
                    mission: m.info?.mission || '',
                    bank_accounts: m.info?.bank_accounts ? JSON.stringify(m.info.bank_accounts) : '',
                });
            } catch (err) {
                console.error('Failed to fetch masjid details', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMasjid();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');

        try {
            await api.put('/tenant/masjid', {
                name: formData.name,
                slug: formData.slug,
                address: formData.address,
                city: formData.city,
                province: formData.province,
                postal_code: formData.postal_code,
                phone: formData.phone,
                email: formData.email,
            });

            await api.put('/tenant/masjid/info', {
                description: formData.description,
                vision: formData.vision,
                mission: formData.mission,
            });

            setMessage('Profil masjid berhasil diperbarui!');
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan perubahan.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 text-xs text-slate-500">
                <RefreshCw className="w-5 h-5 animate-spin mr-2 text-emerald-600" />
                <span>Memuat profil masjid...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto font-sans">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Building className="w-5 h-5 text-emerald-600" />
                    <span>Profile Masjid</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Kelola data umum, lokasi, kontak resmi, serta visi-misi masjid Anda.
                </p>
            </div>

            {message && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{message}</span>
                </div>
            )}

            {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Masjid *</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                        />
                    </div>

                    <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Slug / Subdomain *</label>
                        <input
                            type="text"
                            name="slug"
                            required
                            value={formData.slug}
                            onChange={handleChange}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-slate-100"
                        />
                    </div>

                    <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Resmi</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                        />
                    </div>

                    <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">No. Telepon / WhatsApp</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Lengkap</label>
                        <textarea
                            name="address"
                            rows="2"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kota / Kabupaten</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                        />
                    </div>

                    <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Provinsi</label>
                        <input
                            type="text"
                            name="province"
                            value={formData.province}
                            onChange={handleChange}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Profil Masjid</label>
                        <textarea
                            name="description"
                            rows="3"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-md shadow-emerald-500/20 flex items-center space-x-2 transition"
                    >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>Simpan Perubahan</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
