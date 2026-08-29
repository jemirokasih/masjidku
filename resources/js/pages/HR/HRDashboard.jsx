import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import SearchableSelect from '../../components/SearchableSelect';
import { CalendarClock, Clock, UserCheck, Calendar, RefreshCw, Plus, X, MapPin, Globe } from 'lucide-react';

export default function HRDashboard() {
    const navigate = useNavigate();
    const [todayStatus, setTodayStatus] = useState(null);
    const [attendances, setAttendances] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [submittingLeave, setSubmittingLeave] = useState(false);

    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('id-ID'));

    const [leaveForm, setLeaveForm] = useState({
        leave_type: 'ANNUAL',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        reason: '',
    });

    const [userLocation, setUserLocation] = useState({ lat: null, lng: null, distance: null });

    useEffect(() => {
        const tz = todayStatus?.settings?.timezone || 'Asia/Jakarta';
        const timer = setInterval(() => {
            try {
                setCurrentTime(new Date().toLocaleTimeString('id-ID', { timeZone: tz }));
            } catch {
                setCurrentTime(new Date().toLocaleTimeString('id-ID'));
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [todayStatus?.settings?.timezone]);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        const R = 6371000;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
    };

    const getGeoLocation = () => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve({ latitude: null, longitude: null, location: null });
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const officeLat = todayStatus?.settings?.office_latitude;
                    const officeLng = todayStatus?.settings?.office_longitude;
                    const dist = calculateDistance(lat, lng, officeLat, officeLng);
                    setUserLocation({ lat, lng, distance: dist });

                    resolve({
                        latitude: lat,
                        longitude: lng,
                        location: `GPS (${lat.toFixed(5)}, ${lng.toFixed(5)})`
                    });
                },
                (err) => {
                    console.warn('Geolocation error / denied:', err.message);
                    resolve({ latitude: null, longitude: null, location: null });
                },
                { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
            );
        });
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [todayRes, attRes, leaveRes] = await Promise.all([
                api.get('/hr/attendance/today'),
                api.get('/hr/attendance'),
                api.get('/hr/leaves'),
            ]);
            setTodayStatus(todayRes.data.data);
            setAttendances(attRes.data.data || []);
            setLeaves(leaveRes.data.data || []);
        } catch (err) {
            console.error('Error fetching HR data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const [selectedWorkMode, setSelectedWorkMode] = useState('WFO');
    const [wfhNotes, setWfhNotes] = useState('');

    const handleClockIn = async () => {
        setProcessing(true);
        try {
            const geo = await getGeoLocation();
            const res = await api.post('/hr/attendance/clock-in', { 
                work_mode: selectedWorkMode,
                notes: selectedWorkMode === 'WFH' 
                    ? (wfhNotes ? `WFH: ${wfhNotes}` : 'Work From Home (WFH)')
                    : 'Clock-in WFO via Portal',
                ...geo 
            });
            alert(res.data.message);
            fetchData();
        } catch (err) {
            alert('Gagal Clock In: ' + (err.response?.data?.message || err.message));
        } finally {
            setProcessing(false);
        }
    };

    const handleClockOut = async () => {
        setProcessing(true);
        try {
            const geo = await getGeoLocation();
            const res = await api.post('/hr/attendance/clock-out', {
                work_mode: todayStatus?.attendance?.work_mode || selectedWorkMode,
                ...geo
            });
            alert(res.data.message);
            fetchData();
        } catch (err) {
            alert('Gagal Clock Out: ' + (err.response?.data?.message || err.message));
        } finally {
            setProcessing(false);
        }
    };

    const handleSubmitLeave = async (e) => {
        e.preventDefault();
        setSubmittingLeave(true);
        try {
            await api.post('/hr/leaves', leaveForm);
            alert('Permohonan cuti berhasil diajukan!');
            setShowLeaveModal(false);
            fetchData();
        } catch (err) {
            alert('Gagal mengajukan cuti: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmittingLeave(false);
        }
    };

    const statusPills = {
        PRESENT: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        LATE: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        LEAVE: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        ABSENT: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    };

    const settings = todayStatus?.settings || {};
    const tzLabel = settings.timezone_label || 'WIB';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                        <CalendarClock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span>Modul HR, Presensi Absensi &amp; Permohonan Cuti</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Portal karyawan untuk Clock In/Out real-time, rekap jam kerja, &amp; pengajuan cuti.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => navigate('/hr/overtime')}
                        className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 font-semibold text-xs border border-amber-200 dark:border-amber-800 flex items-center space-x-1.5 transition-all"
                    >
                        <Clock className="w-4 h-4" />
                        <span>Pengajuan Lembur</span>
                    </button>
                    <button
                        onClick={() => navigate('/hr/my-payslips')}
                        className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 font-semibold text-xs border border-indigo-200 dark:border-indigo-800 flex items-center space-x-1.5 transition-all"
                    >
                        <span>📄 Slip Gaji Saya</span>
                    </button>
                    <button
                        onClick={() => navigate('/hr/leaves/create')}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Ajukan Cuti Baru</span>
                    </button>
                </div>
            </div>

            {/* Metric & Presensi Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Real-time Clock In/Out Card */}
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">Presensi Hari Ini</h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {tzLabel}
                        </span>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                        <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                            {currentTime} <span className="text-sm font-semibold text-slate-500">{tzLabel.split(' ')[0]}</span>
                        </div>

                        {/* Jadwal & Info Jam Kantor */}
                        {settings.work_start_time && (
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                                <span>Jam Masuk: <strong className="text-slate-700 dark:text-slate-300 font-mono">{settings.work_start_time}</strong></span>
                                <span>•</span>
                                <span>Toleransi: <strong className="text-slate-700 dark:text-slate-300 font-mono">{settings.late_tolerance_minutes}m</strong></span>
                            </div>
                        )}

                        {/* WFO / WFH Mode Selector Toggle */}
                        {!todayStatus?.has_clocked_in && (
                            <div className="flex rounded-xl bg-slate-200/80 dark:bg-slate-800 p-1 space-x-1 font-bold text-xs">
                                <button
                                    type="button"
                                    onClick={() => setSelectedWorkMode('WFO')}
                                    className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1 ${
                                        selectedWorkMode === 'WFO'
                                            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-extrabold'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    <span>🏢 WFO (Kantor)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedWorkMode('WFH')}
                                    className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1 ${
                                        selectedWorkMode === 'WFH'
                                            ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm font-extrabold'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    <span>🏠 WFH (Rumah)</span>
                                </button>
                            </div>
                        )}

                        {/* WFH Notes Box */}
                        {selectedWorkMode === 'WFH' && !todayStatus?.has_clocked_in && (
                            <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-left space-y-1.5">
                                <div className="flex items-center justify-between text-[10px] font-bold text-purple-600 dark:text-purple-400">
                                    <span>🏠 Mode Kerja Dari Rumah (WFH)</span>
                                    <span className="text-[9px] bg-purple-100 dark:bg-purple-950 px-1.5 py-0.5 rounded">Geofence Bypass</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Catatan WFH / Penugasan (Opsional)..."
                                    value={wfhNotes}
                                    onChange={(e) => setWfhNotes(e.target.value)}
                                    className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
                                />
                            </div>
                        )}

                        <div className="flex justify-center space-x-2">
                            <button
                                onClick={handleClockIn}
                                disabled={processing || todayStatus?.has_clocked_in}
                                className={`px-4 py-2 rounded-lg text-white font-bold text-xs shadow-sm flex items-center space-x-1 disabled:opacity-50 transition-all ${
                                    selectedWorkMode === 'WFH' 
                                        ? 'bg-purple-600 hover:bg-purple-500' 
                                        : 'bg-emerald-600 hover:bg-emerald-500'
                                }`}
                            >
                                {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Clock In ({selectedWorkMode})</span>}
                            </button>
                            <button
                                onClick={handleClockOut}
                                disabled={processing || !todayStatus?.has_clocked_in || todayStatus?.has_clocked_out}
                                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 font-bold text-xs text-white shadow-sm flex items-center space-x-1"
                            >
                                {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Clock Out</span>}
                            </button>
                        </div>

                        {/* GPS Distance Status if checked */}
                        {userLocation.distance !== null && (
                            <div className="text-[10px] font-medium pt-1">
                                {selectedWorkMode === 'WFH' ? (
                                    <span className="text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1 font-semibold">
                                        <MapPin className="w-3 h-3" /> Mode WFH: Terdeteksi {userLocation.distance}m dari kantor (Bebas Radius Kantor)
                                    </span>
                                ) : userLocation.distance <= (settings.office_radius_meters || 100) ? (
                                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                                        <MapPin className="w-3 h-3" /> WFO: Dalam radius kantor ({userLocation.distance}m / max {settings.office_radius_meters || 100}m)
                                    </span>
                                ) : (
                                    <span className="text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
                                        <MapPin className="w-3 h-3" /> WFO: {userLocation.distance}m dari kantor (Max {settings.office_radius_meters || 100}m)
                                    </span>
                                )}
                            </div>
                        )}

                        {todayStatus?.attendance && (
                            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                <div className="flex justify-around">
                                    <span>In: <strong className="text-emerald-600 dark:text-emerald-400">{todayStatus.attendance.clock_in || '-'}</strong></span>
                                    <span>Out: <strong className="text-rose-600 dark:text-rose-400">{todayStatus.attendance.clock_out || '-'}</strong></span>
                                </div>
                                {(todayStatus.attendance.clock_in_ip || todayStatus.attendance.clock_in_location) && (
                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 flex flex-wrap items-center justify-center gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
                                        {todayStatus.attendance.clock_in_ip && (
                                            <span className="flex items-center gap-1 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                                                <Globe className="w-3 h-3" /> {todayStatus.attendance.clock_in_ip}
                                            </span>
                                        )}
                                        {todayStatus.attendance.clock_in_location && (
                                            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                                <MapPin className="w-3 h-3" /> {todayStatus.attendance.clock_in_location}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sisa Kuota Cuti */}
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">Kuota Cuti Tahunan</h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Tahun 2026</p>
                        </div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                            {todayStatus?.employee?.leave_balance ?? 12}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">/ 12 Hari Sisa</span>
                    </div>
                </div>

                {/* Total Permohonan Cuti */}
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">Status Permohonan Cuti</h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Riwayat Pengajuan</p>
                        </div>
                    </div>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                            <span>Total Pengajuan:</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">{leaves.length}</span>
                        </div>
                        <div className="flex justify-between py-1 text-slate-700 dark:text-slate-300">
                            <span>Disetujui:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{leaves.filter(l => l.status === 'APPROVED').length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance Logs Table */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Rekapitulasi Log Presensi Karyawan</h3>

                {loading ? (
                    <div className="flex justify-center p-8 text-xs text-slate-500 dark:text-slate-400">
                        <RefreshCw className="w-4 h-4 animate-spin mr-2 text-blue-600 dark:text-blue-400" />
                        <span>Memuat log presensi...</span>
                    </div>
                ) : attendances.length === 0 ? (
                    <div className="p-8 text-center border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-500 bg-white dark:bg-[#0f172a]">
                        Belum ada log presensi tercatat hari ini. Klik "Clock In" untuk memulai presensi.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                    <th className="py-3 px-4">Tanggal</th>
                                    <th className="py-3 px-4">Karyawan</th>
                                    <th className="py-3 px-4">Mode</th>
                                    <th className="py-3 px-4">Jam Masuk (In)</th>
                                    <th className="py-3 px-4">Jam Keluar (Out)</th>
                                    <th className="py-3 px-4">Total Jam Kerja</th>
                                    <th className="py-3 px-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {attendances.map((att) => (
                                    <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">{att.date}</td>
                                        <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{att.employee?.full_name || 'Karyawan'}</td>
                                        <td className="py-3.5 px-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                                                att.work_mode === 'WFH'
                                                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                                                    : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                            }`}>
                                                {att.work_mode === 'WFH' ? '🏠 WFH' : '🏢 WFO'}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{att.clock_in || '-'}</td>
                                        <td className="py-3.5 px-4 font-mono text-rose-600 dark:text-rose-400 font-bold">{att.clock_out || '-'}</td>
                                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 font-mono">{att.work_hours || 0} Jam</td>
                                        <td className="py-3.5 px-4 text-right">
                                            <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${statusPills[att.status] || statusPills.PRESENT}`}>
                                                {att.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Pengajuan Cuti */}
            {showLeaveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Form Pengajuan Cuti Karyawan</h3>
                            <button onClick={() => setShowLeaveModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSubmitLeave} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Jenis Cuti *</label>
                                <SearchableSelect
                                    options={[
                                        { value: 'ANNUAL', label: 'Cuti Tahunan' },
                                        { value: 'SICK', label: 'Izin Sakit' },
                                        { value: 'SPECIAL', label: 'Cuti Khusus / Pernikahan / Duka' },
                                    ]}
                                    value={leaveForm.leave_type}
                                    onChange={(val) => setLeaveForm({ ...leaveForm, leave_type: val })}
                                    placeholder="Pilih Jenis Cuti..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Tanggal Mulai *</label>
                                    <input
                                        type="date"
                                        required
                                        value={leaveForm.start_date}
                                        onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Tanggal Selesai *</label>
                                    <input
                                        type="date"
                                        required
                                        value={leaveForm.end_date}
                                        onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Alasan Pengajuan Cuti *</label>
                                <textarea
                                    rows={3}
                                    required
                                    value={leaveForm.reason}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                                    placeholder="Jelaskan alasan permohonan..."
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                />
                            </div>

                            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                                <button type="button" onClick={() => setShowLeaveModal(false)} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Batal</button>
                                <button type="submit" disabled={submittingLeave} className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold flex items-center space-x-1">
                                    {submittingLeave ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Kirim Pengajuan</span>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
