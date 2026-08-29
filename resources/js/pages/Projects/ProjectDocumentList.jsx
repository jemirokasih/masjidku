import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { useConfirm } from '../../context/ConfirmContext';
import SearchableSelect from '../../components/SearchableSelect';
import {
    FolderKanban,
    FileText,
    Plus,
    Search,
    Download,
    Trash2,
    Edit,
    RefreshCw,
    Paperclip,
    Building2,
    Calendar,
    UserCheck,
    Filter,
    X,
    FileCheck2
} from 'lucide-react';

export default function ProjectDocumentList() {
    const confirm = useConfirm();

    const [documents, setDocuments] = useState([]);
    const [projects, setProjects] = useState([]);
    const [documentTypes, setDocumentTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProjectFilter, setSelectedProjectFilter] = useState('');
    const [selectedDocTypeFilter, setSelectedDocTypeFilter] = useState('');

    // Modal Add / Edit State
    const [showModal, setShowModal] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [fileInput, setFileInput] = useState(null);

    const [form, setForm] = useState({
        project_id: '',
        document_type_id: '',
        title: '',
        notes: '',
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [docRes, prjRes, dtRes] = await Promise.all([
                api.get('/project-documents'),
                api.get('/projects'),
                api.get('/document-types'),
            ]);

            setDocuments(docRes.data.data || []);
            setProjects(prjRes.data.data || []);
            setDocumentTypes(dtRes.data.data || []);
        } catch (err) {
            console.error('Error loading project documents data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filtered Documents
    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            if (selectedProjectFilter && String(doc.project_id) !== String(selectedProjectFilter)) {
                return false;
            }
            if (selectedDocTypeFilter && String(doc.document_type_id) !== String(selectedDocTypeFilter)) {
                return false;
            }
            if (searchTerm) {
                const s = searchTerm.toLowerCase();
                const titleMatch = doc.title ? doc.title.toLowerCase().includes(s) : false;
                const fileMatch = doc.file_name ? doc.file_name.toLowerCase().includes(s) : false;
                const prjMatch = doc.project?.name ? doc.project.name.toLowerCase().includes(s) : false;
                const typeMatch = doc.document_type?.name ? doc.document_type.name.toLowerCase().includes(s) : false;
                return titleMatch || fileMatch || prjMatch || typeMatch;
            }
            return true;
        });
    }, [documents, selectedProjectFilter, selectedDocTypeFilter, searchTerm]);

    const handleOpenModal = (doc = null) => {
        setEditingDoc(doc);
        setFileInput(null);
        if (doc) {
            setForm({
                project_id: doc.project_id ? String(doc.project_id) : '',
                document_type_id: doc.document_type_id ? String(doc.document_type_id) : '',
                title: doc.title || '',
                notes: doc.notes || '',
            });
        } else {
            setForm({
                project_id: projects.length > 0 ? String(projects[0].id) : '',
                document_type_id: documentTypes.length > 0 ? String(documentTypes[0].id) : '',
                title: '',
                notes: '',
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.project_id) {
            alert('Silakan pilih project.');
            return;
        }
        if (!editingDoc && !fileInput) {
            alert('Silakan pilih berkas dokumen yang akan diunggah.');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('project_id', form.project_id);
            if (form.document_type_id) formData.append('document_type_id', form.document_type_id);
            formData.append('title', form.title);
            if (form.notes) formData.append('notes', form.notes);
            if (fileInput) formData.append('file', fileInput);

            if (editingDoc) {
                formData.append('_method', 'PUT');
                await api.post(`/project-documents/${editingDoc.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Dokumen project berhasil diperbarui!');
            } else {
                await api.post('/project-documents', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Dokumen project berhasil diunggah!');
            }

            setShowModal(false);
            fetchData();
        } catch (err) {
            console.error('Error saving project document:', err);
            alert('Gagal menyimpan dokumen: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (doc) => {
        const ok = await confirm({
            title: 'Hapus Dokumen Project',
            message: `Apakah Anda yakin ingin menghapus berkas '${doc.title}' (${doc.file_name})? Berkas fisik di server akan dihapus permanen.`,
            confirmText: 'Ya, Hapus Permanen',
            variant: 'danger',
        });

        if (!ok) return;

        try {
            await api.delete(`/project-documents/${doc.id}`);
            alert('Dokumen project berhasil dihapus.');
            fetchData();
        } catch (err) {
            alert('Gagal menghapus dokumen: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDownload = async (doc) => {
        try {
            const response = await api.get(`/project-documents/${doc.id}/download`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', doc.file_name || `${doc.title}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Gagal mengunduh berkas dokumen.');
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16">
            {/* Header Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                        <FolderKanban className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span>Dokumen Project</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Manajemen dan pengarsipan seluruh dokumen teknis &amp; administratif proyek (SPK, BAST, MOU, Desain, dll.).
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchData}
                        className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                        title="Muat ulang data"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={() => handleOpenModal(null)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Unggah Dokumen Project</span>
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="p-4 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3 md:space-y-0 md:flex md:items-center md:justify-between gap-4 text-xs">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari berdasarkan judul, nama berkas, atau project..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="min-w-[180px]">
                        <SearchableSelect
                            options={[
                                { value: '', label: 'Semua Project' },
                                ...projects.map(p => ({ value: p.id, label: p.name, code: p.code }))
                            ]}
                            value={selectedProjectFilter}
                            onChange={(val) => setSelectedProjectFilter(val)}
                            placeholder="Filter Project"
                        />
                    </div>

                    <div className="min-w-[180px]">
                        <SearchableSelect
                            options={[
                                { value: '', label: 'Semua Jenis Dokumen' },
                                ...documentTypes.map(dt => ({ value: dt.id, label: `${dt.name} (${dt.code})` }))
                            ]}
                            value={selectedDocTypeFilter}
                            onChange={(val) => setSelectedDocTypeFilter(val)}
                            placeholder="Filter Jenis Dokumen"
                        />
                    </div>

                    {(searchTerm || selectedProjectFilter || selectedDocTypeFilter) && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedProjectFilter('');
                                setSelectedDocTypeFilter('');
                            }}
                            className="p-2 text-slate-500 hover:text-rose-600 bg-slate-100 dark:bg-slate-800 rounded-xl transition-all"
                            title="Reset Filter"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Document Table */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-16 text-center text-xs text-slate-500 dark:text-slate-400 flex justify-center items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                        <span>Memuat daftar dokumen project...</span>
                    </div>
                ) : filteredDocuments.length === 0 ? (
                    <div className="p-16 text-center text-xs text-slate-400 space-y-2">
                        <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
                        <p className="font-semibold text-slate-600 dark:text-slate-400">Belum ada dokumen project</p>
                        <p className="text-[11px] text-slate-400">Silakan klik tombol "Unggah Dokumen Project" untuk menambah dokumen baru.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                                    <th className="py-3 px-4">Judul Dokumen &amp; Berkas</th>
                                    <th className="py-3 px-4">Project / Klien</th>
                                    <th className="py-3 px-4">Jenis Dokumen</th>
                                    <th className="py-3 px-4">Pengunggah &amp; Waktu</th>
                                    <th className="py-3 px-4">Ukuran</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                                {filteredDocuments.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-start gap-2.5">
                                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0 mt-0.5">
                                                    <Paperclip className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-slate-100">{doc.title}</p>
                                                    <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">{doc.file_name}</p>
                                                    {doc.notes && (
                                                        <p className="text-[10px] text-slate-400 italic mt-1 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800 inline-block">
                                                            {doc.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-3.5 px-4">
                                            {doc.project ? (
                                                <div>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-200">{doc.project.name}</p>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                                        <Building2 className="w-3 h-3" />
                                                        <span>{doc.project.client?.company_name || doc.project.client?.name || '-'}</span>
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 font-mono text-[11px]">-</span>
                                            )}
                                        </td>

                                        <td className="py-3.5 px-4">
                                            {doc.document_type ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                                    <FileCheck2 className="w-3 h-3" />
                                                    <span>{doc.document_type.name}</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
                                                    Umum / Standar
                                                </span>
                                            )}
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <div>
                                                <p className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                                    <UserCheck className="w-3 h-3 text-slate-400" />
                                                    <span>{doc.uploader?.name || 'Sistem'}</span>
                                                </p>
                                                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{doc.created_at ? new Date(doc.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                                                </p>
                                            </div>
                                        </td>

                                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                                            {formatBytes(doc.file_size)}
                                        </td>

                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleDownload(doc)}
                                                    className="p-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg transition-colors"
                                                    title="Unduh Berkas"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenModal(doc)}
                                                    className="p-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-lg transition-colors"
                                                    title="Edit Metadata Dokumen"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(doc)}
                                                    className="p-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-lg transition-colors"
                                                    title="Hapus Dokumen"
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

            {/* Modal Upload / Edit Project Document */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span>{editingDoc ? 'Edit Dokumen Project' : 'Unggah Dokumen Project Baru'}</span>
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    Pilih Project *
                                </label>
                                <SearchableSelect
                                    required
                                    options={projects.map(p => ({
                                        value: p.id,
                                        label: p.name,
                                        code: p.code,
                                        sublabel: p.client?.company_name || p.client?.name || ''
                                    }))}
                                    value={form.project_id}
                                    onChange={(val) => setForm({ ...form, project_id: val })}
                                    placeholder="Cari & Pilih Project..."
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    Jenis Dokumen (Opsional)
                                </label>
                                <SearchableSelect
                                    options={[
                                        { value: '', label: '-- Tanpa Jenis / Umum --' },
                                        ...documentTypes.map(dt => ({
                                            value: dt.id,
                                            label: dt.name,
                                            code: dt.code,
                                        }))
                                    ]}
                                    value={form.document_type_id}
                                    onChange={(val) => setForm({ ...form, document_type_id: val })}
                                    placeholder="Pilih Jenis Dokumen..."
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    Judul Dokumen *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="Contoh: SPK Pelaksanaan Proyek Tahap I"
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    Pilih Berkas / File Dokumen {!editingDoc && '*'}
                                </label>
                                <input
                                    type="file"
                                    required={!editingDoc}
                                    onChange={(e) => setFileInput(e.target.files[0] || null)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-500/10 file:text-blue-600 hover:file:bg-blue-500/20"
                                />
                                {editingDoc && (
                                    <p className="text-[10px] text-slate-400 mt-1 italic">
                                        Kosongkan jika tidak ingin mengganti berkas saat ini ({editingDoc.file_name}).
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    Catatan / Keterangan (Opsional)
                                </label>
                                <textarea
                                    rows="3"
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    placeholder="Tambahkan catatan khusus mengenai dokumen ini..."
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-medium"
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all flex items-center gap-2"
                                >
                                    {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                                    <span>{editingDoc ? 'Perbarui Dokumen' : 'Simpan Dokumen'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

