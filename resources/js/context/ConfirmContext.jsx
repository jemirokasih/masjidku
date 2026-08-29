import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, Trash2, CheckCircle2, Info, X } from 'lucide-react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
    const [dialogState, setDialogState] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Lanjutkan',
        cancelText: 'Batal',
        variant: 'danger', // 'danger' | 'warning' | 'success' | 'info'
        isAlertOnly: false,
        resolveFn: null,
    });

    const confirm = useCallback((options = {}) => {
        return new Promise((resolve) => {
            setDialogState({
                isOpen: true,
                title: options.title || 'Konfirmasi Tindakan',
                message: options.message || 'Apakah Anda yakin ingin melanjutkan?',
                confirmText: options.confirmText || 'Ya, Lanjutkan',
                cancelText: options.cancelText || 'Batal',
                variant: options.variant || 'danger',
                isAlertOnly: false,
                resolveFn: resolve,
            });
        });
    }, []);

    const showAlert = useCallback((options = {}) => {
        return new Promise((resolve) => {
            setDialogState({
                isOpen: true,
                title: typeof options === 'string' ? 'Informasi' : (options.title || 'Informasi'),
                message: typeof options === 'string' ? options : (options.message || ''),
                confirmText: options.confirmText || 'Tutup',
                cancelText: '',
                variant: options.variant || 'info',
                isAlertOnly: true,
                resolveFn: resolve,
            });
        });
    }, []);

    const handleConfirm = () => {
        if (dialogState.resolveFn) dialogState.resolveFn(true);
        setDialogState((prev) => ({ ...prev, isOpen: false }));
    };

    const handleCancel = () => {
        if (dialogState.resolveFn) dialogState.resolveFn(false);
        setDialogState((prev) => ({ ...prev, isOpen: false }));
    };

    const getIcon = () => {
        switch (dialogState.variant) {
            case 'danger':
                return <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />;
            case 'warning':
                return <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
            case 'success':
                return <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
            default:
                return <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
        }
    };

    const getIconBg = () => {
        switch (dialogState.variant) {
            case 'danger':
                return 'bg-rose-500/10 border-rose-500/20';
            case 'warning':
                return 'bg-amber-500/10 border-amber-500/20';
            case 'success':
                return 'bg-emerald-500/10 border-emerald-500/20';
            default:
                return 'bg-blue-500/10 border-blue-500/20';
        }
    };

    const getButtonClass = () => {
        switch (dialogState.variant) {
            case 'danger':
                return 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20';
            case 'warning':
                return 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20';
            case 'success':
                return 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20';
            default:
                return 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20';
        }
    };

    return (
        <ConfirmContext.Provider value={{ confirm, showAlert }}>
            {children}

            {/* Custom Modal Backdrop & Popup Box */}
            {dialogState.isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-md bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-200">
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-2xl border shrink-0 ${getIconBg()}`}>
                                {getIcon()}
                            </div>
                            <div className="space-y-1 pr-4">
                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                                    {dialogState.title}
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {dialogState.message}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                            {!dialogState.isAlertOnly && (
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
                                >
                                    {dialogState.cancelText}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleConfirm}
                                className={`px-5 py-2 text-xs font-bold rounded-xl shadow-md transition-all ${getButtonClass()}`}
                            >
                                {dialogState.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
}
