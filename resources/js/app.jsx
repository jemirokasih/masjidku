import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ConfirmProvider } from './context/ConfirmContext';
import MainLayout from './layouts/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ClientList from './pages/Clients/ClientList';
import ClientFormPage from './pages/Clients/ClientFormPage';
import ClientDetailPage from './pages/Clients/ClientDetailPage';
import ClientContactList from './pages/Clients/ClientContactList';
import LeadList from './pages/Leads/LeadList';
import LeadFormPage from './pages/Leads/LeadFormPage';
import LeadDetailPage from './pages/Leads/LeadDetailPage';
import InvoiceList from './pages/Invoices/InvoiceList';
import InvoiceFormPage from './pages/Invoices/InvoiceFormPage';
import QuoteList from './pages/Quotes/QuoteList';
import QuoteFormPage from './pages/Quotes/QuoteFormPage';

import ProductList from './pages/Products/ProductList';
import PaymentList from './pages/Payments/PaymentList';
import PaymentFormPage from './pages/Payments/PaymentFormPage';
import PaymentDetailPage from './pages/Payments/PaymentDetailPage';
import TaxInvoiceList from './pages/Invoices/TaxInvoiceList';
import TaxInvoiceFormPage from './pages/Invoices/TaxInvoiceFormPage';
import TaxInvoiceDetailPage from './pages/Invoices/TaxInvoiceDetailPage';
import ProjectList from './pages/Projects/ProjectList';
import ProjectDetailPage from './pages/Projects/ProjectDetailPage';
import ProjectFormPage from './pages/Projects/ProjectFormPage';
import ProjectDocumentList from './pages/Projects/ProjectDocumentList';
import MyTasksPage from './pages/Projects/MyTasksPage';
import HRDashboard from './pages/HR/HRDashboard';
import AttendanceRecapPage from './pages/HR/AttendanceRecapPage';
import LeaveManagementPage from './pages/HR/LeaveManagementPage';
import LeaveFormPage from './pages/HR/LeaveFormPage';
import ReimbursementPage from './pages/HR/ReimbursementPage';
import ReimbursementFormPage from './pages/HR/ReimbursementFormPage';
import EmployeeList from './pages/HR/EmployeeList';
import EmployeeFormPage from './pages/HR/EmployeeFormPage';
import EmployeeDetailPage from './pages/HR/EmployeeDetailPage';
import ContractManagementPage from './pages/HR/ContractManagementPage';
import PayrollPeriodListPage from './pages/HR/Payroll/PayrollPeriodListPage';
import PayrollDetailSheetPage from './pages/HR/Payroll/PayrollDetailSheetPage';
import MyPayslipsPage from './pages/HR/Payroll/MyPayslipsPage';
import OvertimeRequestPage from './pages/HR/Overtime/OvertimeRequestPage';
import OvertimeManagementPage from './pages/HR/Overtime/OvertimeManagementPage';
import UserManagement from './pages/Users/UserManagement';
import RoleManagementPage from './pages/Users/RoleManagementPage';
import SettingsPage from './pages/Settings/SettingsPage';
import AuditLogList from './pages/AuditLogs/AuditLogList';
import DeliveryOrderList from './pages/DeliveryOrders/DeliveryOrderList';
import DeliveryOrderFormPage from './pages/DeliveryOrders/DeliveryOrderFormPage';
import DeliveryOrderDetailPage from './pages/DeliveryOrders/DeliveryOrderDetailPage';
import VendorList from './pages/Vendors/VendorList';
import VendorQuoteList from './pages/Vendors/VendorQuoteList';
import VendorInvoiceList from './pages/Vendors/VendorInvoiceList';
import VendorInvoiceFormPage from './pages/Vendors/VendorInvoiceFormPage';
import NotificationListPage from './pages/Notifications/NotificationListPage';
import InvoicePortal from './pages/Portal/InvoicePortal';
import SetupWizardPage from './pages/Setup/SetupWizardPage';
import DomainList from './pages/Domains/DomainList';
import WebmailPage from './pages/IT/Webmail/WebmailPage';



const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

// Protected Route Wrapper Component
const ProtectedRoute = ({ children, requiredRoles, module }) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#070a12] flex items-center justify-center text-slate-500 dark:text-slate-400 font-sans text-xs">
                <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
                    <span>Memuat Mikrotek Business Suite...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRoles && requiredRoles.length > 0) {
        const userRole = (user?.role || 'staff').toLowerCase();
        if (['administrator', 'admin', 'superadmin'].includes(userRole)) {
            return children;
        }

        // Dynamic module permission check if user has permissions array
        if (module) {
            const rawPerms = user?.permissions;
            let userPerms = Array.isArray(rawPerms) ? rawPerms : [];
            if (typeof rawPerms === 'string') {
                try { userPerms = JSON.parse(rawPerms); } catch (e) { userPerms = []; }
            }

            if (Array.isArray(userPerms) && userPerms.length > 0) {
                const hasPerm = userPerms.some(p => p === '*' || p === module || p.startsWith(`${module}.`));
                if (hasPerm) {
                    return children;
                }
            }
        }

        const allowedRoles = requiredRoles.map(r => r.toLowerCase());
        if (allowedRoles.includes(userRole)) {
            return children;
        }

        return (
            <div className="p-8 max-w-lg mx-auto text-center space-y-4 border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 rounded-2xl mt-12 shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto font-extrabold text-lg">
                    403
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Akses Ditolak (Access Denied)</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                    Peranan Anda (<strong className="uppercase">{userRole}</strong>) tidak diizinkan untuk mengakses halaman ini.
                </p>
                <a href="/" className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md">
                    Kembali ke Dashboard
                </a>
            </div>
        );
    }

    return children;
};

// Public Route Guard (prevents logged in users from visiting /login)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return null;
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};

// Root Route Handler (shows LandingPage for guests, MainLayout for authenticated users)
const RootRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#070a12] flex items-center justify-center text-slate-500 text-xs">
                <span>Memuat Masjidku...</span>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LandingPage />;
    }

    return <MainLayout />;
};

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <AuthProvider>
                    <ConfirmProvider>
                        <BrowserRouter>
                            <Routes>
                                <Route path="/landing" element={<LandingPage />} />
                                <Route
                                    path="/login"
                                    element={
                                        <PublicRoute>
                                            <Login />
                                        </PublicRoute>
                                    }
                                />
                                <Route
                                    path="/register"
                                    element={
                                        <PublicRoute>
                                            <Register />
                                        </PublicRoute>
                                    }
                                />

                        {/* Public Setup Wizard & Client Portal Routes */}
                        <Route path="/setup" element={<SetupWizardPage />} />
                        <Route path="/portal/invoice/:token" element={<InvoicePortal />} />
                        <Route path="/portal/invoice/:number" element={<InvoicePortal />} />

                        {/* App Routes */}
                        <Route path="/" element={<RootRoute />}>
                            <Route index element={<Dashboard />} />
                            <Route path="clients" element={<ProtectedRoute requiredRoles={['admin', 'finance', 'project_manager']}><ClientList /></ProtectedRoute>} />
                            <Route path="clients/create" element={<ProtectedRoute requiredRoles={['admin', 'finance', 'project_manager']}><ClientFormPage /></ProtectedRoute>} />
                            <Route path="clients/:id" element={<ProtectedRoute requiredRoles={['admin', 'finance', 'project_manager']}><ClientDetailPage /></ProtectedRoute>} />
                            <Route path="clients/:id/edit" element={<ProtectedRoute requiredRoles={['admin', 'finance', 'project_manager']}><ClientFormPage /></ProtectedRoute>} />
                            <Route path="client-contacts" element={<ProtectedRoute requiredRoles={['admin', 'finance', 'project_manager']}><ClientContactList /></ProtectedRoute>} />

                            <Route path="leads" element={<ProtectedRoute requiredRoles={['admin', 'finance', 'project_manager', 'leads']} module="leads"><LeadList /></ProtectedRoute>} />
                            <Route path="leads/create" element={<ProtectedRoute requiredRoles={['admin', 'finance', 'project_manager', 'leads']} module="leads"><LeadFormPage /></ProtectedRoute>} />
                            <Route path="leads/:id" element={<ProtectedRoute requiredRoles={['admin', 'finance', 'project_manager', 'leads']} module="leads"><LeadDetailPage /></ProtectedRoute>} />
                            <Route path="leads/:id/edit" element={<ProtectedRoute requiredRoles={['admin', 'finance', 'project_manager', 'leads']} module="leads"><LeadFormPage /></ProtectedRoute>} />

                            <Route path="invoices" element={<ProtectedRoute requiredRoles={['admin', 'finance']}><InvoiceList /></ProtectedRoute>} />
                            <Route path="invoices/create" element={<ProtectedRoute requiredRoles={['admin', 'finance']}><InvoiceFormPage /></ProtectedRoute>} />
                            <Route path="invoices/:id/edit" element={<ProtectedRoute requiredRoles={['admin', 'finance']}><InvoiceFormPage /></ProtectedRoute>} />
                            <Route path="quotes" element={<ProtectedRoute requiredRoles={['admin', 'finance', 'project_manager']}><QuoteList /></ProtectedRoute>} />
                            <Route path="quotes/create" element={<ProtectedRoute requiredRoles={['admin', 'finance', 'project_manager']}><QuoteFormPage /></ProtectedRoute>} />
                            <Route path="quotes/:id/edit" element={<ProtectedRoute requiredRoles={['admin', 'finance', 'project_manager']}><QuoteFormPage /></ProtectedRoute>} />

                            <Route path="products" element={<ProtectedRoute requiredRoles={['admin', 'finance']}><ProductList /></ProtectedRoute>} />
                            <Route path="projects" element={<ProtectedRoute requiredRoles={['admin', 'project_manager', 'finance', 'staff']}><ProjectList /></ProtectedRoute>} />
                            <Route path="project-documents" element={<ProtectedRoute requiredRoles={['admin', 'project_manager', 'finance', 'staff']} module="projects"><ProjectDocumentList /></ProtectedRoute>} />
                            <Route path="projects/create" element={<ProtectedRoute requiredRoles={['admin', 'project_manager']}><ProjectFormPage /></ProtectedRoute>} />
                            <Route path="projects/:id" element={<ProtectedRoute requiredRoles={['admin', 'project_manager', 'finance', 'staff']}><ProjectDetailPage /></ProtectedRoute>} />
                            <Route path="projects/:id/edit" element={<ProtectedRoute requiredRoles={['admin', 'project_manager']}><ProjectFormPage /></ProtectedRoute>} />
                            <Route path="my-tasks" element={<ProtectedRoute requiredRoles={['admin', 'project_manager', 'finance', 'staff']}><MyTasksPage /></ProtectedRoute>} />
                            <Route path="domains" element={<ProtectedRoute requiredRoles={['admin', 'project_manager']} module="domains"><DomainList /></ProtectedRoute>} />
                            <Route path="webmail" element={<ProtectedRoute><WebmailPage /></ProtectedRoute>} />
                            <Route path="payments" element={<ProtectedRoute requiredRoles={['admin', 'finance']}><PaymentList /></ProtectedRoute>} />
                            <Route path="payments/create" element={<ProtectedRoute requiredRoles={['admin', 'finance']}><PaymentFormPage /></ProtectedRoute>} />
                            <Route path="payments/:id" element={<ProtectedRoute requiredRoles={['admin', 'finance']}><PaymentDetailPage /></ProtectedRoute>} />
                            <Route path="payments/:id/edit" element={<ProtectedRoute requiredRoles={['admin', 'finance']}><PaymentFormPage /></ProtectedRoute>} />

                            <Route path="tax-invoices" element={<ProtectedRoute requiredRoles={['admin', 'finance', 'project_manager']}><TaxInvoiceList /></ProtectedRoute>} />
                            <Route path="tax-invoices/create" element={<ProtectedRoute requiredRoles={['admin', 'finance', 'project_manager']}><TaxInvoiceFormPage /></ProtectedRoute>} />
                            <Route path="tax-invoices/:id" element={<ProtectedRoute requiredRoles={['admin', 'finance', 'project_manager']}><TaxInvoiceDetailPage /></ProtectedRoute>} />
                            <Route path="tax-invoices/:id/edit" element={<ProtectedRoute requiredRoles={['admin', 'finance', 'project_manager']}><TaxInvoiceFormPage /></ProtectedRoute>} />

                            <Route path="delivery-orders" element={<ProtectedRoute requiredRoles={['admin', 'finance', 'project_manager']} module="delivery_orders"><DeliveryOrderList /></ProtectedRoute>} />
                            <Route path="delivery-orders/create" element={<ProtectedRoute requiredRoles={['admin', 'finance', 'project_manager']} module="delivery_orders"><DeliveryOrderFormPage /></ProtectedRoute>} />
                            <Route path="delivery-orders/:id" element={<ProtectedRoute requiredRoles={['admin', 'finance', 'project_manager']} module="delivery_orders"><DeliveryOrderDetailPage /></ProtectedRoute>} />
                            <Route path="delivery-orders/:id/edit" element={<ProtectedRoute requiredRoles={['admin', 'finance', 'project_manager']} module="delivery_orders"><DeliveryOrderFormPage /></ProtectedRoute>} />

                            <Route path="vendors" element={<ProtectedRoute requiredRoles={['admin', 'finance', 'project_manager', 'superadmin']}><VendorList /></ProtectedRoute>} />
                            <Route path="vendor-quotes" element={<ProtectedRoute requiredRoles={['admin', 'finance', 'project_manager', 'superadmin']}><VendorQuoteList /></ProtectedRoute>} />
                            <Route path="vendor-invoices" element={<ProtectedRoute requiredRoles={['admin', 'finance', 'project_manager', 'superadmin']}><VendorInvoiceList /></ProtectedRoute>} />
                            <Route path="vendor-invoices/create" element={<ProtectedRoute requiredRoles={['admin', 'finance', 'project_manager', 'superadmin']}><VendorInvoiceFormPage /></ProtectedRoute>} />
                            <Route path="hr" element={<HRDashboard />} />
                            <Route path="hr/attendance-recap" element={<ProtectedRoute requiredRoles={['admin', 'hr', 'superadmin', 'project_manager']}><AttendanceRecapPage /></ProtectedRoute>} />
                            <Route path="hr/leaves" element={<LeaveManagementPage />} />
                            <Route path="hr/leaves/create" element={<LeaveFormPage />} />
                            <Route path="hr/reimbursements" element={<ReimbursementPage />} />
                            <Route path="hr/reimbursements/create" element={<ReimbursementFormPage />} />
                            <Route path="hr/reimbursements/:id/edit" element={<ProtectedRoute requiredRoles={['admin', 'hr']}><ReimbursementFormPage /></ProtectedRoute>} />
                            <Route path="hr/contracts" element={<ProtectedRoute requiredRoles={['admin', 'hr']}><ContractManagementPage /></ProtectedRoute>} />
                            <Route path="hr/payroll" element={<ProtectedRoute requiredRoles={['admin', 'hr', 'finance', 'superadmin']}><PayrollPeriodListPage /></ProtectedRoute>} />
                            <Route path="hr/payroll/:id" element={<ProtectedRoute requiredRoles={['admin', 'hr', 'finance', 'superadmin']}><PayrollDetailSheetPage /></ProtectedRoute>} />
                            <Route path="hr/my-payslips" element={<ProtectedRoute requiredRoles={['admin', 'hr', 'finance', 'project_manager', 'staff', 'superadmin']}><MyPayslipsPage /></ProtectedRoute>} />
                            <Route path="hr/overtime" element={<ProtectedRoute requiredRoles={['admin', 'hr', 'finance', 'project_manager', 'staff', 'superadmin']}><OvertimeRequestPage /></ProtectedRoute>} />
                            <Route path="hr/overtime-management" element={<ProtectedRoute requiredRoles={['admin', 'hr', 'finance', 'superadmin']}><OvertimeManagementPage /></ProtectedRoute>} />
                            <Route path="employees" element={<ProtectedRoute requiredRoles={['admin', 'hr']}><EmployeeList /></ProtectedRoute>} />
                            <Route path="employees/create" element={<ProtectedRoute requiredRoles={['admin', 'hr']}><EmployeeFormPage /></ProtectedRoute>} />
                            <Route path="employees/:id" element={<ProtectedRoute requiredRoles={['admin', 'hr']}><EmployeeDetailPage /></ProtectedRoute>} />
                            <Route path="employees/:id/edit" element={<ProtectedRoute requiredRoles={['admin', 'hr']}><EmployeeFormPage /></ProtectedRoute>} />
                            <Route path="users" element={<ProtectedRoute requiredRoles={['admin']}><UserManagement /></ProtectedRoute>} />
                            <Route path="roles" element={<ProtectedRoute requiredRoles={['admin']}><RoleManagementPage /></ProtectedRoute>} />
                            <Route path="notifications" element={<NotificationListPage />} />
                            <Route path="audit-logs" element={<ProtectedRoute requiredRoles={['admin', 'superadmin']}><AuditLogList /></ProtectedRoute>} />

                            <Route path="settings" element={<ProtectedRoute requiredRoles={['admin']}><SettingsPage /></ProtectedRoute>} />

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </ConfirmProvider>
        </AuthProvider>
        </ThemeProvider>
    </QueryClientProvider>
    );
}


const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    );
}
