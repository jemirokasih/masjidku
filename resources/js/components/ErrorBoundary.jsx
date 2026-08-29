import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
                    <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-base font-bold text-white">Terjadi Kesalahan Aplikasi</h2>
                            <p className="text-xs text-slate-400">
                                {this.state.error?.message || 'Aplikasi mengalami kesalahan yang tidak terduga.'}
                            </p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Muat Ulang Halaman</span>
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

