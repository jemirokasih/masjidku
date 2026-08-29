import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Settings, Palette, Globe, Shield, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
    const [themes, setThemes] = useState([]);
    const [activeThemeId, setActiveThemeId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const [themesRes, masjidRes] = await Promise.all([
                    api.get('/tenant/themes'),
                    api.get('/tenant/masjid')
                ]);
                setThemes(themesRes.data.data || []);
                setActiveThemeId(masjidRes.data.data?.active_theme_id || 1);
            } catch (err) {
                console.error('Failed to load settings', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSelectTheme = async (themeId) => {
        setSaving(true);
        setMessage('');
        try {
            await api.post('/tenant/themes/select', { theme_id: themeId });
            setActiveThemeId(themeId);
            setMessage('Tema berhasil diaktifkan untuk website masjid Anda!');
        } catch (err) {
            alert('Gagal memilih tema: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12 text-xs text-slate-500">
                <RefreshCw className="w-5 h-5 animate-spin mr-2 text-emerald-600" />
                <span>Memuat pengaturan...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto font-sans">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-emerald-600" />
                    <span>Pengaturan Website & Tema</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Ganti template tampilan visual website dan atur preferensi akun masjid Anda.
                </p>
            </div>

            {message && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{message}</span>
                </div>
            )}

            {/* Theme Marketplace */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Palette className="w-4 h-4 text-emerald-600" />
                        <span>Pilihan Template Tampilan Website</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Klik "Pilih & Terapkan" untuk mengganti desain publik website Anda secara instant.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {themes.map((t) => {
                        const isSelected = activeThemeId === t.id;
                        return (
                            <div
                                key={t.id}
                                className={`rounded-2xl border p-5 space-y-3 transition flex flex-col justify-between ${
                                    isSelected
                                        ? 'border-emerald-600 bg-emerald-500/5 ring-2 ring-emerald-500/20'
                                        : 'border-slate-200 dark:border-slate-800'
                                }`}
                            >
                                <div className="space-y-3">
                                    <div className="h-32 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-400">
                                        Preview {t.name}
                                    </div>
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t.name}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.description}</p>
                                </div>

                                <button
                                    onClick={() => handleSelectTheme(t.id)}
                                    disabled={saving || isSelected}
                                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition ${
                                        isSelected
                                            ? 'bg-emerald-600 text-white cursor-default'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {isSelected ? '✓ Tema Aktif' : 'Pilih & Terapkan'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

