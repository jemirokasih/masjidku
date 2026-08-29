import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationDropdown from '../components/NotificationDropdown';
import {
    LayoutDashboard,
    Layout,
    Users,
    FileText,
    Receipt,
    Package,
    CreditCard,
    CalendarClock,
    Clock,
    Timer,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    Building2,
    ShieldCheck,
    Shield,
    Command,
    Sun,
    Moon,
    Database,
    UserCheck,
    FolderKanban,
    CalendarDays,
    Calendar,
    Tag,
    Layers,
    FileCheck,
    Banknote,
    FileSpreadsheet,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    User,
    History,
    Truck,
    Target,
    CheckSquare,
    Globe,
    Mail,
    PanelLeftClose,
    PanelLeftOpen
} from 'lucide-react';

export default function MainLayout() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        return localStorage.getItem('mbs_sidebar_collapsed') === 'true';
    });
    const [collapsedGroups, setCollapsedGroups] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('mbs_collapsed_groups') || '{}');
        } catch (e) {
            return {};
        }
    });
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    const userRole = (user?.role || 'staff').toLowerCase();

    const toggleSidebarCollapse = () => {
        const next = !sidebarCollapsed;
        setSidebarCollapsed(next);
        localStorage.setItem('mbs_sidebar_collapsed', String(next));
    };

    const toggleGroup = (groupName) => {
        setCollapsedGroups(prev => {
            const next = { ...prev, [groupName]: !prev[groupName] };
            localStorage.setItem('mbs_collapsed_groups', JSON.stringify(next));
            return next;
        });
    };

    const ensureArray = (val) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') {
            try {
                const parsed = JSON.parse(val);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                return [];
            }
        }
        return [];
    };

    const isPermitted = (item) => {
        if (['administrator', 'admin', 'superadmin'].includes(userRole)) return true;

        const moduleKey = typeof item === 'object' ? item.module : null;
        const userPermissions = ensureArray(user?.permissions);

        if (moduleKey && userPermissions.length > 0) {
            const hasPerm = userPermissions.some(p => p === '*' || p === moduleKey || p.startsWith(`${moduleKey}.`));
            if (hasPerm) {
                return true;
            }
            return false;
        }

        const roles = typeof item === 'object' ? item.roles : item;
        if (!Array.isArray(roles) || roles.length === 0) return true;
        return roles.map(r => r.toLowerCase()).includes(userRole);
    };

    // Close user profile dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isPlatformAdmin = ['platform_admin', 'admin', 'administrator', 'superadmin'].includes(userRole);

    const navGroups = isPlatformAdmin ? [
        {
            groupName: 'ADMIN MASJIDKU',
            items: [
                { name: 'Dashboard Admin', path: '/', icon: LayoutDashboard },
                { name: 'Verifikasi Masjid', path: '/admin/verifikasi-masjid', icon: ShieldCheck },
                { name: 'Marketplace Tema', path: '/settings', icon: Settings },
                { name: 'Manajemen User', path: '/users', icon: Users },
            ]
        }
    ] : [
        {
            groupName: 'CMS PENGURUS',
            items: [
                { name: 'Dashboard', path: '/', icon: LayoutDashboard },
                { name: 'Profile Masjid', path: '/masjid-profile', icon: Building2 },
                { name: 'Hero & Tampilan', path: '/cms-pages', icon: Layout },
                { name: 'Kelola Konten', path: '/content', icon: FileText },
                { name: 'Pengaturan', path: '/settings', icon: Settings },
            ]
        }
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        const [basePath, searchStr] = path.split('?');
        if (location.pathname !== basePath) return false;
        if (!searchStr) {
            return location.search === '' || location.search === '?tab=catalog';
        }
        return location.search.includes(searchStr);
    };

    const isWebmail = location.pathname === '/webmail';

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row font-sans transition-colors duration-200">
            {/* Mobile Topbar */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#064e3b] text-slate-100 border-b border-emerald-800 sticky top-0 z-50">
                <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center font-bold text-white shadow-md text-sm">
                        🕌
                    </div>
                    <span className="font-bold text-sm text-white tracking-tight">Masjidku</span>
                </div>
                <div className="flex items-center space-x-2">
                    <NotificationDropdown />
                    <button
                        onClick={logout}
                        title="Logout"
                        className="p-1.5 rounded-lg bg-emerald-900/60 text-rose-300 hover:bg-rose-500/10"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-1.5 rounded-lg bg-emerald-900/60 text-slate-200 hover:text-white"
                    >
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Sidebar Desktop */}
            <aside className={`fixed inset-y-0 left-0 z-40 bg-[#064e3b] text-slate-200 border-r border-emerald-900 flex flex-col justify-between transition-all duration-300 ease-in-out md:static md:translate-x-0 ${
                sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
            } ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}>
                <div className={`space-y-5 overflow-y-auto overflow-x-hidden ${sidebarCollapsed ? 'p-2.5' : 'p-4'}`}>
                    {/* Logo & Brand Header with Single Minimize Button */}
                    <div className={`flex items-center pt-1 ${sidebarCollapsed ? 'justify-center' : 'justify-between px-2'}`}>
                        <div className="flex items-center space-x-3 overflow-hidden">
                            <div className="w-9 h-9 rounded-xl bg-emerald-800 p-0.5 shadow-lg shrink-0 flex items-center justify-center text-xl text-white">
                                🕌
                            </div>
                            {!sidebarCollapsed && (
                                <div className="truncate">
                                    <h2 className="font-extrabold text-sm text-white tracking-tight leading-none">MASJIDKU</h2>
                                    <span className="text-[9px] font-bold text-emerald-200 tracking-widest uppercase">
                                        {isPlatformAdmin ? 'ADMIN MASJIDKU' : 'PANEL PENGURUS'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Single Minimize / Expand Toggle Button in Sidebar Header */}
                        <button
                            onClick={toggleSidebarCollapse}
                            title={sidebarCollapsed ? "Perluas Sidebar" : "Kecilkan Sidebar (Minimize)"}
                            className={`hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ${
                                sidebarCollapsed ? 'mt-2' : ''
                            }`}
                        >
                            {sidebarCollapsed ? (
                                <PanelLeftOpen className="w-4 h-4 text-blue-400" />
                            ) : (
                                <PanelLeftClose className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    {/* Navigation Groups (Collapsible Accordion) */}
                    <nav className="space-y-4">
                        {navGroups.map((group) => {
                            const visibleItems = group.items.filter(item => isPermitted(item));
                            if (visibleItems.length === 0) return null;

                            const hasActiveChild = visibleItems.some(item => isActive(item.path));
                            // Group is collapsed if explicitly marked in state, unless it contains current active page
                            const isGroupCollapsed = collapsedGroups[group.groupName] && !hasActiveChild;

                            return (
                                <div key={group.groupName} className="space-y-1">
                                    {sidebarCollapsed ? (
                                        <div className="h-px bg-slate-800/80 my-2 mx-1" title={group.groupName}></div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => toggleGroup(group.groupName)}
                                            className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-extrabold text-slate-400 hover:text-slate-200 uppercase tracking-wider transition rounded-lg hover:bg-slate-800/40 group"
                                            title={`Klik untuk ${isGroupCollapsed ? 'membuka' : 'menutup'} grup ${group.groupName}`}
                                        >
                                            <span>{group.groupName}</span>
                                            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-transform duration-200 ${
                                                isGroupCollapsed ? '-rotate-90' : 'rotate-0'
                                            }`} />
                                        </button>
                                    )}

                                    {/* Items inside group */}
                                    {(!isGroupCollapsed || sidebarCollapsed) && (
                                        <div className="space-y-1">
                                            {visibleItems.map((item) => {
                                                const active = isActive(item.path);
                                                const Icon = item.icon;
                                                return (
                                                    <Link
                                                        key={item.name}
                                                        to={item.path}
                                                        onClick={() => setSidebarOpen(false)}
                                                        title={sidebarCollapsed ? item.name : undefined}
                                                        className={`flex items-center rounded-xl text-xs font-medium transition-all ${
                                                            sidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                                                        } ${
                                                            active
                                                                ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                                                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                                        }`}
                                                    >
                                                        <div className={`flex items-center ${sidebarCollapsed ? '' : 'space-x-2.5'}`}>
                                                            <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                                                            {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
                                                        </div>
                                                        {!sidebarCollapsed && active && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </div>

                {/* User Avatar & Logout Footer */}
                <div className={`border-t border-slate-800 bg-[#0c1220] ${sidebarCollapsed ? 'p-2' : 'p-3'}`}>
                    {sidebarCollapsed ? (
                        <div className="flex flex-col items-center space-y-2 py-1">
                            <div 
                                title={`${user?.name || 'Administrator'} (${user?.role || 'admin'})`}
                                className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 font-bold text-xs shrink-0 cursor-pointer"
                            >
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <button
                                onClick={logout}
                                title="Keluar / Logout"
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                            <div className="flex items-center space-x-2.5 overflow-hidden">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 font-bold text-xs shrink-0">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                </div>
                                <div className="truncate">
                                    <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Administrator'}</p>
                                    <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                        {user?.role || 'admin'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                title="Keluar / Logout"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar Header (Clean without duplicate minimize button) */}
                <header className="hidden md:flex items-center justify-between px-6 py-3.5 bg-[#0f172a] text-slate-100 border-b border-slate-800 sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center space-x-3">
                        <div className="relative w-72">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari transaksi, klien, invoice..."
                                className="w-full pl-9 pr-12 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                            />
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-0.5 text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono border border-slate-700">
                                <Command className="w-2.5 h-2.5" />
                                <span>K</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Company Identifier */}
                        <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                            <Building2 className="w-3.5 h-3.5 text-blue-400" />
                            <span className="font-medium text-slate-200">PT Mikrotek Zemiro Indonesia</span>
                        </div>

                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors flex items-center space-x-1.5 text-xs font-semibold"
                            title="Ganti Mode Tampilan Canvas (Light / Dark)"
                        >
                            {theme === 'dark' ? (
                                <>
                                    <Sun className="w-4 h-4 text-amber-400" />
                                    <span className="text-[11px] hidden xl:inline">Mode Terang</span>
                                </>
                            ) : (
                                <>
                                    <Moon className="w-4 h-4 text-slate-300" />
                                    <span className="text-[11px] hidden xl:inline">Mode Gelap</span>
                                </>
                            )}
                        </button>

                        {/* Notification Bell Dropdown */}
                        <NotificationDropdown />

                        <div className="h-5 w-px bg-slate-800"></div>

                        {/* User Profile & Logout Dropdown (Top Navbar Right) */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className={`flex items-center space-x-2.5 p-1.5 pr-2.5 rounded-xl border transition-all ${
                                    userMenuOpen
                                        ? 'bg-slate-800 border-slate-700 text-white shadow-sm'
                                        : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800/80 hover:border-slate-700'
                                }`}
                            >
                                <div className="relative">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                                        {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                    </div>
                                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0f172a]"></span>
                                </div>
                                <div className="text-left hidden sm:block">
                                    <p className="text-xs font-bold text-slate-100 leading-tight truncate max-w-[110px]">
                                        {user?.name || 'Administrator'}
                                    </p>
                                    <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">
                                        {user?.role || 'admin'}
                                    </p>
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180 text-blue-400' : ''}`} />
                            </button>

                            {/* User Profile Popover */}
                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2.5 w-64 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                                    {/* Profile Summary Card */}
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20 shrink-0">
                                            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                                                {user?.name || 'Administrator'}
                                            </h4>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                                {user?.email || 'admin@mikrotek.co.id'}
                                            </p>
                                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                                <ShieldCheck className="w-3 h-3" />
                                                Role: {(user?.role || 'admin').toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Links */}
                                    <div className="py-1 space-y-0.5 text-xs">
                                        <Link
                                            to="/settings"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
                                        >
                                            <User className="w-4 h-4 text-blue-500" />
                                            <span>Profil &amp; Akun Saya</span>
                                        </Link>
                                        <Link
                                            to="/settings"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
                                        >
                                            <Settings className="w-4 h-4 text-purple-500" />
                                            <span>Pengaturan Sistem</span>
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                toggleTheme();
                                                setUserMenuOpen(false);
                                            }}
                                            className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-xs"
                                        >
                                            <div className="flex items-center space-x-2.5">
                                                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
                                                <span>Mode Tampilan</span>
                                            </div>
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                {theme === 'dark' ? 'Dark' : 'Light'}
                                            </span>
                                        </button>
                                    </div>

                                    <div className="border-t border-slate-200 dark:border-slate-800 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                logout();
                                            }}
                                            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-bold transition-colors text-xs"
                                        >
                                            <div className="flex items-center space-x-2.5">
                                                <LogOut className="w-4 h-4 text-rose-500" />
                                                <span>Keluar dari Sistem (Logout)</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Body Canvas Content Area */}
                <main className={`flex-grow bg-slate-100 dark:bg-[#090d16] ${
                    isWebmail ? 'p-0 flex flex-col overflow-hidden h-full' : 'flex-1 overflow-y-auto p-4 md:p-8'
                }`}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
