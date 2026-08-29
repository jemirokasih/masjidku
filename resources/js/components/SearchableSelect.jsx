import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export default function SearchableSelect({
    options = [],
    value = '',
    onChange,
    placeholder = '-- Pilih / Cari Option --',
    disabled = false,
    required = false,
    className = '',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);

    const selectedOption = options.find(opt => String(opt.value) === String(value));

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        const labelMatch = opt.label ? String(opt.label).toLowerCase().includes(search) : false;
        const sublabelMatch = opt.sublabel ? String(opt.sublabel).toLowerCase().includes(search) : false;
        const codeMatch = opt.code ? String(opt.code).toLowerCase().includes(search) : false;
        const aliasMatch = opt.alias ? String(opt.alias).toLowerCase().includes(search) : false;
        const nameMatch = opt.name ? String(opt.name).toLowerCase().includes(search) : false;
        const companyMatch = opt.company_name ? String(opt.company_name).toLowerCase().includes(search) : false;
        const rawAliasMatch = opt.raw?.alias ? String(opt.raw.alias).toLowerCase().includes(search) : false;
        const rawNameMatch = opt.raw?.name ? String(opt.raw.name).toLowerCase().includes(search) : false;
        const rawCompanyMatch = opt.raw?.company_name ? String(opt.raw.company_name).toLowerCase().includes(search) : false;

        return labelMatch || sublabelMatch || codeMatch || aliasMatch || nameMatch || companyMatch || rawAliasMatch || rawNameMatch || rawCompanyMatch;
    });

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
        setSearchTerm('');
    };

    const [dropUp, setDropUp] = useState(false);

    const toggleOpen = () => {
        if (disabled) return;
        if (!isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            if (spaceBelow < 280 && rect.top > 250) {
                setDropUp(true);
            } else {
                setDropUp(false);
            }
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className={`relative w-full ${className}`} ref={containerRef}>
            {/* Clickable Trigger Box */}
            <div
                onClick={toggleOpen}
                className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border ${
                    isOpen
                        ? 'border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800'
                } rounded-lg text-xs flex items-center justify-between cursor-pointer transition-all ${
                    disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-300 dark:hover:border-slate-700'
                }`}
            >
                <div className="flex items-center space-x-2 truncate">
                    {selectedOption ? (
                        <div className="flex items-center space-x-2 truncate">
                            {selectedOption.code && (
                                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                                    {selectedOption.code}
                                </span>
                            )}
                            <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                {selectedOption.label}
                            </span>
                            {(selectedOption.alias || selectedOption.raw?.alias) && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
                                    {selectedOption.alias || selectedOption.raw?.alias}
                                </span>
                            )}
                            {selectedOption.sublabel && (
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                    ({selectedOption.sublabel})
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-slate-400 font-medium">{placeholder}</span>
                    )}
                </div>

                <div className="flex items-center space-x-1 shrink-0 ml-2">
                    {value && !required && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange('');
                            }}
                            className="p-0.5 text-slate-400 hover:text-rose-500 rounded"
                            title="Bersihkan pilihan"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {/* Hidden Input for Form HTML Validation */}
            {required && (
                <input
                    type="text"
                    readOnly
                    value={value || ''}
                    required
                    className="opacity-0 absolute inset-0 pointer-events-none -z-10"
                />
            )}

            {/* Dropdown Search & Options Popup Box */}
            {isOpen && (
                <div
                    className={`absolute left-0 right-0 ${
                        dropUp ? 'bottom-full mb-1' : 'top-full mt-1'
                    } z-[999] bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden space-y-1 p-2 min-w-[240px]`}
                >

                    {/* Search Input Box */}
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            autoFocus
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Ketik untuk mencari..."
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Options List */}
                    <div className="max-h-56 overflow-y-auto space-y-0.5 pt-1">
                        {filteredOptions.length === 0 ? (
                            <div className="p-3 text-center text-xs text-slate-400 italic">
                                Tidak ada opsi yang cocok dengan "{searchTerm}"
                            </div>
                        ) : (
                            filteredOptions.map((opt) => {
                                const isSelected = String(opt.value) === String(value);
                                return (
                                    <div
                                        key={opt.value}
                                        onClick={() => handleSelect(opt.value)}
                                        className={`px-3 py-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                                            isSelected
                                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                                                : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2 truncate">
                                            {opt.code && (
                                                <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
                                                    {opt.code}
                                                </span>
                                            )}
                                            <span className="truncate">{opt.label}</span>
                                            {(opt.alias || opt.raw?.alias) && (
                                                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
                                                    {opt.alias || opt.raw?.alias}
                                                </span>
                                            )}
                                            {opt.sublabel && (
                                                <span className="text-[10px] text-slate-400 font-normal truncate">
                                                    - {opt.sublabel}
                                                </span>
                                            )}
                                        </div>
                                        {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 ml-2" />}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
