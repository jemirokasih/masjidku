import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useConfirm } from '../../context/ConfirmContext';
import {
    Database,
    FolderArchive,
    HardDrive,
    RefreshCw,
    Download,
    Trash2,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Server,
    ShieldCheck,
    Save,
    FileText,
    Copy,
    Check,
    ArrowRight,
    HelpCircle,
    ExternalLink,
    Layers,
    FileDown
} from 'lucide-react';

export default function BackupSettingsTab() {
    const { confirm } = useConfirm();
    const [stats, setStats] = useState(null);
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [creatingBackup, setCreatingBackup] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);
    const [downloadingFile, setDownloadingFile] = useState(null);
    const [lastCreatedBackup, setLastCreatedBackup] = useState(null);
    const [copiedSnippet, setCopiedSnippet] = useState(null);

    const [form, setForm] = useState({
        backup_directory_path: '',
        backup_retention_days: 30,
        backup_auto_schedule: 'daily',
        backup_driver: 'local',
    });

    const fetchData = async (isInitial = false) => {
        if (isInitial) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }

        try {
            const [statsRes, listRes] = await Promise.all([
                api.get('/settings/backup/stats'),
                api.get('/settings/backup/list'),
            ]);

            if (statsRes.data?.data) {
                setStats(statsRes.data.data);
                setForm(prev => ({
                    ...prev,
                    backup_directory_path: statsRes.data.data.backup_directory || '',
                    backup_retention_days: statsRes.data.data.retention_days || 30,
                    backup_auto_schedule: statsRes.data.data.auto_schedule || 'daily',
                    backup_driver: statsRes.data.data.backup_driver || 'local',
                }));
            }

            if (Array.isArray(listRes.data?.data)) {
                setBackups(listRes.data.data);
            }
        } catch (err) {
            console.error('Error fetching backup data:', err);
        } finally {
            if (isInitial) {
                setLoading(false);
            } else {
                setRefreshing(false);
            }
        }
    };

    useEffect(() => {
        fetchData(true);
    }, []);

    const handleDownload = async (filename) => {
        setDownloadingFile(filename);
        try {
            const response = await api.get(`/settings/backup/download/${filename}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Gagal mengunduh berkas backup: ' + (err.response?.data?.message || err.message));
        } finally {
            setDownloadingFile(null);
        }
    };

    const handleCreateBackup = async () => {
        setCreatingBackup(true);
        setLastCreatedBackup(null);
        try {
            const res = await api.post('/settings/backup/create', {
                include_db: true,
                include_files: true,
            });

            const createdData = res.data?.data;
            if (createdData) {
                setLastCreatedBackup(createdData);
                // Prepend to local backups list immediately
                setBackups(prev => [
                    {
                        filename: createdData.filename,
                        file_path: createdData.file_path,
                        size_bytes: createdData.size_bytes,
                        size_formatted: createdData.size_formatted,
                        created_at: createdData.created_at,
                        created_at_human: new Date().toLocaleString('id-ID'),
                        is_valid: true,
                    },
                    ...prev.filter(b => b.filename !== createdData.filename),
                ]);
            }

            // Refetch fresh stats and full list
            fetchData(false);
        } catch (err) {
            alert('Gagal membuat backup: ' + (err.response?.data?.message || err.message));
        } finally {
            setCreatingBackup(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await api.post('/settings/backup/sync', {
                custom_target_path: form.backup_directory_path || null,
            });
            alert(`✓ Sinkronisasi ke safe storage berhasil! ${res.data.data.synced_count} file disinkronkan.`);
            fetchData(false);
        } catch (err) {
            alert('Gagal melakukan sinkronisasi: ' + (err.response?.data?.message || err.message));
        } finally {
            setSyncing(false);
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            await api.post('/settings/backup/settings', form);
            alert('✓ Pengaturan safe backup & storage berhasil disimpan!');
            fetchData(false);
        } catch (err) {
            alert('Gagal menyimpan pengaturan: ' + (err.response?.data?.message || err.message));
        } finally {
            setSavingSettings(false);
        }
    };

    const handleDelete = async (filename) => {
        const ok = await confirm({
            title: 'Hapus Arsip Backup',
            message: `Apakah Anda yakin ingin menghapus arsip backup "${filename}"? File fisik arsip akan dihapus permanen.`,
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;

        try {
            await api.delete(`/settings/backup/${filename}`);
            setBackups(prev => prev.filter(b => b.filename !== filename));
            if (lastCreatedBackup?.filename === filename) {
                setLastCreatedBackup(null);
            }
            fetchData(false);
        } catch (err) {
            alert('Gagal menghapus backup: ' + (err.response?.data?.message || err.message));
        }
    };

    const copyToClipboard = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopiedSnippet(key);
        setTimeout(() => setCopiedSnippet(null), 2000);
    };

    if (loading) {
        return (
            <div className="py-20 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-xs">Memuat data dan status penyimpanan aman...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl text-xs font-sans animate-fade-in">
            
            {/* Title Header */}
            <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 pb-1 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Backup Data &amp; Safe Document Storage</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => fetchData(false)}
                        disabled={refreshing}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                        title="Segarkan Data"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-500' : ''}`} />
                        <span>{refreshing ? 'Memuat...' : 'Segarkan Data'}</span>
                    </button>
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Sistem perlindungan ganda: mencadangkan seluruh file fisik dokumen (kontrak kerja, invoice, penawaran, kwitansi, surat jalan, struk reimbursement, e-Faktur) beserta database snapshot ke direktori aman terpisah, NAS (Network Attached Storage), atau SFTP.
                </p>
            </div>

            {/* Success Banner when backup newly created */}
            {lastCreatedBackup && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-sm">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="font-bold text-sm">Backup Selesai Dibuat!</div>
                            <div className="font-mono text-xs opacity-90">
                                {lastCreatedBackup.filename} ({lastCreatedBackup.size_formatted}, {lastCreatedBackup.total_files} berkas)
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => handleDownload(lastCreatedBackup.filename)}
                        disabled={downloadingFile === lastCreatedBackup.filename}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 shrink-0 transition-all cursor-pointer"
                    >
                        {downloadingFile === lastCreatedBackup.filename ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <FileDown className="w-4 h-4" />
                        )}
                        <span>Unduh File ZIP Sekarang</span>
                    </button>
                </div>
            )}

            {/* 1. Storage Status Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Dokumen Fisik */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                        <span className="font-bold text-[11px]">Dokumen Fisik</span>
                        <FolderArchive className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">
                        {stats?.files_size_formatted || '0 B'}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Total {stats?.files_count || 0} berkas dokumen tersimpan
                    </div>
                </div>

                {/* Card 2: Database Size */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                        <span className="font-bold text-[11px]">Database Snapshot</span>
                        <Database className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">
                        {stats?.db_size_formatted || '0 B'}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Semua tabel, relasi, transaksi &amp; audit log
                    </div>
                </div>

                {/* Card 3: Total Arsip Backup */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                        <span className="font-bold text-[11px]">Total Arsip Backup</span>
                        <HardDrive className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">
                        {stats?.backups_size_formatted || '0 B'}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {backups.length} arsip ZIP terkompresi
                    </div>
                </div>

                {/* Card 4: Safe Directory Status */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                        <span className="font-bold text-[11px]">Status Safe Storage</span>
                        <ShieldCheck className={`w-4 h-4 ${stats?.is_directory_writable ? 'text-emerald-500' : 'text-amber-500'}`} />
                    </div>
                    <div className="flex items-center space-x-1.5 pt-0.5">
                        <span className={`w-2 h-2 rounded-full ${stats?.is_directory_writable ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                            {stats?.is_directory_writable ? 'Read-Write OK' : 'Akses Terbatas'}
                        </span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate" title={stats?.backup_directory}>
                        {stats?.backup_directory}
                    </div>
                </div>
            </div>

            {/* 2. Quick Action Panel */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900/90 dark:to-indigo-950/40 border border-blue-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                        <Server className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Aksi Backup &amp; Sinkronisasi Data Instan</span>
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                        Jalankan pembuatan paket arsip ZIP mandiri atau sinkronkan file dokumen fisik ke folder target safe storage sekarang.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                        type="button"
                        disabled={creatingBackup}
                        onClick={handleCreateBackup}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
                    >
                        {creatingBackup ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FolderArchive className="w-4 h-4" />}
                        <span>{creatingBackup ? 'Sedang Mengompresi Backup...' : 'Buat Backup Lengkap (ZIP)'}</span>
                    </button>

                    <button
                        type="button"
                        disabled={syncing}
                        onClick={handleSync}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
                    >
                        {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <HardDrive className="w-4 h-4" />}
                        <span>{syncing ? 'Menyinkronkan...' : 'Sinkronkan ke Safe Storage / NAS'}</span>
                    </button>
                </div>
            </div>

            {/* 3. Settings Configuration Form */}
            <form onSubmit={handleSaveSettings} className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>Konfigurasi Direktori Aman &amp; Kebijakan Retensi</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Tentukan lokasi folder fisik tempat arsip disimpan. Anda dapat mengarahkan path ini ke direktori lokal terpisah, shared folder NAS (mount point SMB/NFS), atau harddisk eksternal.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Jalur Direktori Safe Storage (Custom Safe Path / NAS Mount)
                        </label>
                        <input
                            type="text"
                            placeholder="Contoh: /Volumes/BackupNAS/Mikrotek-Data atau /mnt/nas_share/backups"
                            value={form.backup_directory_path}
                            onChange={(e) => setForm({ ...form, backup_directory_path: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                            Kosongkan untuk menggunakan direktori penyimpanan bawaan default (<code className="font-mono text-slate-500">storage/app/backups</code>).
                        </p>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Retensi Penyimpanan (Hari)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="3650"
                            required
                            value={form.backup_retention_days}
                            onChange={(e) => setForm({ ...form, backup_retention_days: parseInt(e.target.value) || 30 })}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                            Arsip backup yang berusia lebih dari nilai ini akan otomatis dibersihkan untuk menjaga kapasitas disk.
                        </p>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Jadwal Otomatis (Scheduler)
                        </label>
                        <select
                            value={form.backup_auto_schedule}
                            onChange={(e) => setForm({ ...form, backup_auto_schedule: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:border-blue-500"
                        >
                            <option value="daily">Otomatis Setiap Hari (Jam 02:00 Pagi)</option>
                            <option value="weekly">Otomatis Setiap Minggu (Minggu Jam 02:00 Pagi)</option>
                            <option value="disabled">Nonaktifkan Jadwal Otomatis</option>
                        </select>
                        <p className="text-[10px] text-slate-400 mt-1">
                            Berjalan otomatis melalui cron job Laravel Scheduler (<code className="font-mono text-slate-500">schedule:run</code>).
                        </p>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={savingSettings}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
                    >
                        {savingSettings ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>Simpan Pengaturan Backup</span>
                    </button>
                </div>
            </form>

            {/* 4. Backup History Table */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                            <FolderArchive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Riwayat Berkas Backup Tersedia ({backups.length})</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Daftar paket arsip ZIP yang tersimpan di safe storage. Klik tombol Unduh ZIP untuk menyimpan cadangan ke komputer lokal.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => fetchData(false)}
                        disabled={refreshing}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Segarkan Riwayat"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-500' : ''}`} />
                    </button>
                </div>

                {backups.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 italic space-y-2">
                        <FolderArchive className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                        <p>Belum ada berkas backup yang dibuat.</p>
                        <p className="text-[11px] text-slate-400">Klik "Buat Backup Lengkap (ZIP)" di atas untuk membuat arsip cadangan pertama Anda.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    <th className="py-2.5 px-3">Nama Berkas ZIP</th>
                                    <th className="py-2.5 px-3">Ukuran</th>
                                    <th className="py-2.5 px-3">Tanggal Dibuat</th>
                                    <th className="py-2.5 px-3 text-center">Integritas</th>
                                    <th className="py-2.5 px-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {backups.map((b) => (
                                    <tr key={b.filename} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                        <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                                            <div className="flex items-center space-x-2">
                                                <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                                                <span className="truncate max-w-xs sm:max-w-md">{b.filename}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                                            {b.size_formatted}
                                        </td>
                                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                                            {b.created_at_human}
                                        </td>
                                        <td className="py-3 px-3 text-center">
                                            {b.is_valid ? (
                                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    <span>Valid</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[10px] font-semibold border border-rose-500/20">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    <span>Korup</span>
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-3 text-right">
                                            <div className="inline-flex items-center space-x-1.5">
                                                <button
                                                    type="button"
                                                    disabled={downloadingFile === b.filename}
                                                    onClick={() => handleDownload(b.filename)}
                                                    className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors flex items-center space-x-1 font-semibold cursor-pointer"
                                                    title="Unduh Berkas ZIP"
                                                >
                                                    {downloadingFile === b.filename ? (
                                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                    ) : (
                                                        <Download className="w-3.5 h-3.5" />
                                                    )}
                                                    <span>Unduh ZIP</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(b.filename)}
                                                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                                                    title="Hapus Berkas Backup"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 5. In-App Integration & Disaster Recovery Guides */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-500" />
                    <span>Panduan Teknis: Integrasi NAS &amp; Disaster Recovery</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {/* NAS Guide */}
                    <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 space-y-2">
                        <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <Server className="w-3.5 h-3.5 text-blue-500" />
                            <span>1. Menghubungkan ke NAS (Synology / QNAP / SMB)</span>
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            Mount folder shared NAS Anda ke direktori server menggunakan NFS atau CIFS/SMB:
                        </p>
                        <div className="relative">
                            <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-[10px] overflow-x-auto">
{`# Mount SMB/CIFS di Linux / macOS
sudo mkdir -p /mnt/nas_backup
sudo mount -t cifs //192.168.1.100/backups /mnt/nas_backup -o username=nasuser,password=secret`}
                            </pre>
                            <button
                                type="button"
                                onClick={() => copyToClipboard('sudo mount -t cifs //192.168.1.100/backups /mnt/nas_backup -o username=nasuser,password=secret', 'mount')}
                                className="absolute top-2 right-2 p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                                title="Salin"
                            >
                                {copiedSnippet === 'mount' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-400">
                            Setelah ter-mount, masukkan <code className="font-mono text-blue-500">/mnt/nas_backup</code> pada form konfigurasi direktori di atas.
                        </p>
                    </div>

                    {/* Disaster Recovery Guide */}
                    <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 space-y-2">
                        <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            <span>2. Prosedur Disaster Recovery (Pemulihan Server)</span>
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            Jika server mengalami kendala fisik, ekstrak file arsip backup ZIP ke server baru:
                        </p>
                        <div className="relative">
                            <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-[10px] overflow-x-auto">
{`# 1. Ekstrak ZIP
unzip backup_mikrotek_XXXX.zip -d /tmp/restore

# 2. Restore Database MySQL
mysql -u root -p mikrotek_neo < /tmp/restore/database/database_dump.sql

# 3. Restore Dokumen Fisik
cp -r /tmp/restore/documents/* /var/www/mikrotek/storage/app/public/`}
                            </pre>
                            <button
                                type="button"
                                onClick={() => copyToClipboard('unzip backup_mikrotek_XXXX.zip -d /tmp/restore\nmysql -u root -p mikrotek_neo < /tmp/restore/database/database_dump.sql\ncp -r /tmp/restore/documents/* /var/www/mikrotek/storage/app/public/', 'restore')}
                                className="absolute top-2 right-2 p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                                title="Salin"
                            >
                                {copiedSnippet === 'restore' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
