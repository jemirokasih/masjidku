import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/axios';
import {
    Maximize2,
    Minimize2,
    ExternalLink,
    RefreshCw,
    Settings,
    X
} from 'lucide-react';

export default function WebmailPage() {
    const [webmailUrl, setWebmailUrl] = useState('/webmail/');
    const [iframeSrc, setIframeSrc] = useState('');
    const [loading, setLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const iframeRef = useRef(null);
    const menuRef = useRef(null);

    const fetchSettings = async () => {
        setLoading(true);
        const token = localStorage.getItem('mbs_token') || '';
        try {
            const res = await api.get('/settings/company');
            const baseUrl = res.data?.data?.webmail_url || '/webmail/';
            setWebmailUrl(baseUrl);
            
            const finalSrc = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}auth_token=${encodeURIComponent(token)}`;
            setIframeSrc(finalSrc);
        } catch (e) {
            console.error('Gagal memuat URL Webmail:', e);
            const finalSrc = `/webmail/?auth_token=${encodeURIComponent(token)}`;
            setIframeSrc(finalSrc);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleRefreshIframe = () => {
        if (iframeRef.current && iframeSrc) {
            iframeRef.current.src = iframeSrc;
        }
        setShowMenu(false);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        setShowMenu(false);
    };

    return (
        <div className={`relative flex-grow flex flex-col w-full h-full min-h-[500px] ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900 p-0' : ''}`}>
            {/* Viewport & Embedded App Container */}
            <div className="relative flex-grow w-full h-full bg-white dark:bg-[#0f172a] flex flex-col">
                
                {/* Floating Small Gear Icon in Top Right */}
                <div className="absolute top-3 right-3 z-30" ref={menuRef}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-slate-200 border border-slate-700/60 shadow-lg flex items-center justify-center transition-all backdrop-blur hover:scale-105"
                        title="Opsi & Pengaturan Webmail"
                    >
                        {showMenu ? <X className="w-4 h-4 text-rose-400" /> : <Settings className="w-4 h-4 text-slate-300" />}
                    </button>

                    {/* Popover Menu Dropdown */}
                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 space-y-1 z-40 text-xs animate-in fade-in zoom-in duration-150">
                            <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                                <span>Webmail Controls</span>
                                <span className="text-[10px] text-blue-400 font-mono">RC v1.7</span>
                            </div>

                            <button
                                onClick={handleRefreshIframe}
                                className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2 transition font-medium"
                            >
                                <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                                <span>Muat Ulang Webmail</span>
                            </button>

                            <a
                                href={webmailUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setShowMenu(false)}
                                className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2 transition font-medium"
                            >
                                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Buka di Tab Baru</span>
                            </a>

                            <button
                                onClick={toggleFullscreen}
                                className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2 transition font-medium"
                            >
                                {isFullscreen ? (
                                    <>
                                        <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                                        <span>Kecilkan Tampilan</span>
                                    </>
                                ) : (
                                    <>
                                        <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                                        <span>Layar Penuh (Fullscreen)</span>
                                    </>
                                )}
                            </button>

                            <div className="pt-1 border-t border-slate-800">
                                <Link
                                    to="/settings?tab=webmail"
                                    onClick={() => setShowMenu(false)}
                                    className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-blue-600 hover:text-white flex items-center space-x-2 transition font-medium"
                                >
                                    <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                                    <span>Pengaturan Server Email</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Webmail Iframe Viewport with unique stable key to prevent reloads */}
                {loading ? (
                    <div className="h-full flex items-center justify-center text-slate-400 space-x-2 font-mono text-xs">
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                        <span>Memuat Roundcube Webmail Client...</span>
                    </div>
                ) : (
                    <iframe
                        key="roundcube-webmail-viewport"
                        ref={iframeRef}
                        src={iframeSrc}
                        title="Roundcube Webmail Client Viewport"
                        className="w-full h-full border-0 bg-white"
                        allow="clipboard-read; clipboard-write; autoplay; fullscreen"
                    />
                )}
            </div>
        </div>
    );
}
