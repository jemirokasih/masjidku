import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { openPdfPreview } from '../../utils/pdfPreview';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';
import SearchableSelect from '../../components/SearchableSelect';
import BackupSettingsTab from './BackupSettingsTab';
import RegistrarSettings from './RegistrarSettings';
import HostingTypeSettings from './HostingTypeSettings';
import { Settings, Building, Percent, CreditCard, Users, Save, RefreshCw, Layers, Plus, Trash2, CheckCircle2, Star, Edit3, X, Mail, Send, Server, Key, ShieldCheck, FileText, Hash, HelpCircle, Sparkles, QrCode, Image, PenTool, Code, Briefcase, UserCheck, Info, Receipt, Banknote, MapPin, Clock, Navigation, Globe, Database, FolderKanban, Truck } from 'lucide-react';

const previewDocumentNumber = (pattern, prefix, nextNumber, digits) => {
    if (!pattern) return '-';
    const padded = String(nextNumber || 1).padStart(parseInt(digits) || 3, '0');
    const now = new Date();
    const year = now.getFullYear();
    const yy = String(year).slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return pattern
        .replace(/{NUMBER}/g, padded)
        .replace(/{PREFIX}/g, prefix || '')
        .replace(/{YEAR}/g, year)
        .replace(/{YY}/g, yy)
        .replace(/{MONTH}/g, month)
        .replace(/{DAY}/g, day);
};

export default function SettingsPage() {
    const { user } = useAuth();
    const { confirm } = useConfirm();
    const location = useLocation();
    const rawQueryTab = new URLSearchParams(location.search).get('tab');
    const queryTab = rawQueryTab === 'hr_master' ? 'departments' : rawQueryTab;
    const [activeTab, setActiveTab] = useState(queryTab || 'company');

    useEffect(() => {
        if (queryTab) {
            setActiveTab(queryTab);
        }
    }, [queryTab]);

    const [company, setCompany] = useState({
        company_name: '',
        company_email: '',
        company_phone: '',
        company_address: '',
        tax_number: '',
        currency_code: 'IDR',
        currency_symbol: 'Rp',

        // Timezone, Geolocation & Attendance
        timezone: 'Asia/Jakarta',
        office_latitude: -6.2928,
        office_longitude: 106.8286,
        office_radius_meters: 100,
        require_location_check: false,
        work_start_time: '08:30:00',
        work_end_time: '17:30:00',
        late_tolerance_minutes: 15,

        // Document Numbering Settings
        invoice_prefix: 'MZIINV',
        invoice_next_number: 1,
        invoice_number_format: '{NUMBER}/{PREFIX}/{MONTH}/{YEAR}',
        invoice_digits: 3,

        quote_prefix: 'QUO',
        quote_next_number: 1,
        quote_number_format: '{NUMBER}/{PREFIX}/{MONTH}/{YEAR}',
        quote_digits: 3,

        payment_prefix: 'PAY',
        payment_next_number: 1,
        payment_number_format: '{PREFIX}-{YEAR}-{NUMBER}',
        payment_digits: 4,

        bank_details: '',
        default_terms: '',

        // Signature
        signature_type: 'QR_CODE',
        signature_image_path: '',
        signature_signer_name: '',
        signature_signer_title: '',
        receipt_template: 'modern',
        invoice_template: 'modern',
        quote_template: 'modern',
        contract_template: 'formal',
        contract_prefix: 'SPK-',
        contract_next_number: 1,
        contract_number_format: '{PREFIX}{YEAR}/{MONTH}/{NUMBER}',
        contract_digits: 4,

        // Payslip & Payroll Settings
        payslip_prefix: 'SLIP/',
        payslip_next_number: 1,
        payslip_number_format: '{PREFIX}{YEAR}/{MONTH}/{NUMBER}',
        payslip_digits: 4,
        payslip_template: 'modern',
        payroll_cutoff_start_day: 21,
        payroll_cutoff_end_day: 20,
        payroll_late_deduction_type: 'FLAT_PER_OCCURRENCE',
        payroll_late_deduction_rate: 0,
        payroll_absent_deduction_type: 'PRORATA_BASE_SALARY',
        payroll_absent_deduction_rate: 0,

        // Overtime Settings
        overtime_calculation_type: 'FLAT_PER_HOUR',
        overtime_flat_rate: 0,
        overtime_multiplier: 1.5,
        overtime_work_hours_per_day: 8,

        // Delivery Order PDF Settings
        do_show_receiver: true,
        do_show_sender: true,
        do_show_driver: false,
        do_show_logistics: false,
        do_show_manager: false,
        do_title_receiver: 'Penerima (Klien)',
        do_title_sender: 'Pengirim (Mikrotek)',
        do_title_driver: 'Pengemudi / Kurir',
        do_title_logistics: 'Petugas Logistik',
        do_title_manager: 'Mengetahui (Manager)',

        // SMTP
        mail_mailer: 'smtp',
        mail_host: 'smtp.gmail.com',
        mail_port: 587,
        mail_username: 'noreply@mzi.co.id',
        mail_password: '',
        mail_encryption: 'tls',
        mail_from_address: 'noreply@mzi.co.id',
        mail_from_name: 'Mikrotek Business Suite',
        webmail_url: '/webmail/',
        rdash_api_key: '',
        rdash_api_secret: '',
        rdash_base_url: 'https://api.rdash.id/v1',
        srsx_api_key: '',
        srsx_user_id: '',
        srsx_base_url: '',
    });

    const [gettingLocation, setGettingLocation] = useState(false);
    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Browser Anda tidak mendukung geolokasi GPS.');
            return;
        }
        setGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCompany(prev => ({
                    ...prev,
                    office_latitude: pos.coords.latitude,
                    office_longitude: pos.coords.longitude
                }));
                setGettingLocation(false);
                alert(`Berhasil mengambil koordinat GPS: Lat ${pos.coords.latitude.toFixed(6)}, Lng ${pos.coords.longitude.toFixed(6)}`);
            },
            (err) => {
                setGettingLocation(false);
                alert('Gagal mengambil lokasi GPS: ' + err.message);
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    const [uploadingSig, setUploadingSig] = useState(false);
    const [receiptTemplates, setReceiptTemplates] = useState([]);
    const [invoiceTemplates, setInvoiceTemplates] = useState([]);
    const [quoteTemplates, setQuoteTemplates] = useState([]);
    const [contractTemplates, setContractTemplates] = useState([]);
    const [payslipTemplates, setPayslipTemplates] = useState([]);
    const [docCategory, setDocCategory] = useState('quote'); // 'quote' | 'invoice' | 'receipt' | 'contract' | 'payslip'


    const [taxRates, setTaxRates] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [users, setUsers] = useState([]);

    // Multi-bank accounts state
    const [companyBankAccounts, setCompanyBankAccounts] = useState([]);
    const [showBankModal, setShowBankModal] = useState(false);
    const [editingBank, setEditingBank] = useState(null);
    const [submittingBank, setSubmittingBank] = useState(false);

    // Tax Rates state
    const [showTaxModal, setShowTaxModal] = useState(false);
    const [editingTax, setEditingTax] = useState(null);
    const [submittingTax, setSubmittingTax] = useState(false);
    const [taxForm, setTaxForm] = useState({
        name: '',
        code: '',
        percent: 11,
        is_active: true,
    });

    // Payment Methods state
    const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
    const [editingPaymentMethod, setEditingPaymentMethod] = useState(null);
    const [submittingPaymentMethod, setSubmittingPaymentMethod] = useState(false);
    const [paymentMethodForm, setPaymentMethodForm] = useState({
        name: '',
        code: '',
        description: '',
        is_active: true,
    });

    // Test SMTP modal state
    const [showSmtpModal, setShowSmtpModal] = useState(false);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [testingSmtp, setTestingSmtp] = useState(false);

    const [bankForm, setBankForm] = useState({
        bank_name: 'Bank BCA',
        account_number: '',
        account_holder: '',
        branch: '',
        swift_code: '',
        is_primary: false,
        is_active: true,
    });

    // Master HR state
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [employmentStatuses, setEmploymentStatuses] = useState([]);

    // Check Update state
    const [checkingUpdate, setCheckingUpdate] = useState(false);
    const handleCheckUpdate = () => {
        setCheckingUpdate(true);
        setTimeout(() => {
            setCheckingUpdate(false);
            alert('Sistem Mikrotek Business Suite Neo Anda sudah berada pada versi TERBARU (v2.5.4)! Tidak ada pembaruan baru yang tersedia saat ini.');
        }, 1200);
    };

    // Master Reimbursement Categories state
    const [reimbursementCategories, setReimbursementCategories] = useState([]);
    const [showReimbCatModal, setShowReimbCatModal] = useState(false);
    const [editingReimbCat, setEditingReimbCat] = useState(null);
    const [submittingReimbCat, setSubmittingReimbCat] = useState(false);
    const [reimbCatForm, setReimbCatForm] = useState({
        name: '',
        code: '',
        icon: '📝',
        max_limit: 0,
        description: '',
        is_active: true,
    });

    // Master Document Types state
    const [documentTypes, setDocumentTypes] = useState([]);
    const [showDocTypeModal, setShowDocTypeModal] = useState(false);
    const [editingDocType, setEditingDocType] = useState(null);
    const [submittingDocType, setSubmittingDocType] = useState(false);
    const [docTypeForm, setDocTypeForm] = useState({
        name: '',
        code: '',
        description: '',
        is_active: true,
    });

    // Department modal CRUD state
    const [showDepModal, setShowDepModal] = useState(false);
    const [editingDep, setEditingDep] = useState(null);
    const [submittingDep, setSubmittingDep] = useState(false);
    const [depForm, setDepForm] = useState({
        name: '',
        code: '',
        description: '',
        is_active: true,
    });

    // Position modal CRUD state
    const [showPosModal, setShowPosModal] = useState(false);
    const [editingPos, setEditingPos] = useState(null);
    const [submittingPos, setSubmittingPos] = useState(false);
    const [posForm, setPosForm] = useState({
        name: '',
        code: '',
        department_id: '',
        description: '',
        is_active: true,
    });

    // Employment Status modal CRUD state
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [editingStatus, setEditingStatus] = useState(null);
    const [submittingStatus, setSubmittingStatus] = useState(false);
    const [statusForm, setStatusForm] = useState({
        name: '',
        code: '',
        description: '',
        is_active: true,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cRes, tRes, pRes, uRes, depRes, posRes, statusRes, bankRes, tmplRes, invTmplRes, quoTmplRes, conTmplRes, reimbCatRes, payTmplRes, docTypeRes] = await Promise.all([
                api.get('/settings'),
                api.get('/tax-rates'),
                api.get('/payment-methods'),
                api.get('/users'),
                api.get('/hr/departments'),
                api.get('/hr/positions'),
                api.get('/hr/employment-statuses'),
                api.get('/company-bank-accounts'),
                api.get('/receipt-templates'),
                api.get('/invoice-templates'),
                api.get('/quote-templates'),
                api.get('/contract-templates'),
                api.get('/hr/reimbursement-categories'),
                api.get('/payslip-templates'),
                api.get('/document-types'),
            ]);
            if (cRes.data.data) {
                setCompany({
                    ...cRes.data.data,
                    mail_mailer: cRes.data.data.mail_mailer || 'smtp',
                    mail_host: cRes.data.data.mail_host || 'smtp.gmail.com',
                    mail_port: cRes.data.data.mail_port || 587,
                    mail_username: cRes.data.data.mail_username || '',
                    mail_password: cRes.data.data.mail_password || '',
                    mail_encryption: cRes.data.data.mail_encryption || 'tls',
                    mail_from_address: cRes.data.data.mail_from_address || cRes.data.data.company_email || '',
                    mail_from_name: cRes.data.data.mail_from_name || cRes.data.data.company_name || '',
                    webmail_url: cRes.data.data.webmail_url || '/webmail/',
                    receipt_template: cRes.data.data.receipt_template || 'modern',
                    invoice_template: cRes.data.data.invoice_template || 'modern',
                    quote_template: cRes.data.data.quote_template || 'modern',
                    contract_template: cRes.data.data.contract_template || 'formal',
                    payslip_template: cRes.data.data.payslip_template || 'modern',

                    invoice_number_format: cRes.data.data.invoice_number_format || '{NUMBER}/{PREFIX}/{MONTH}/{YEAR}',
                    invoice_digits: cRes.data.data.invoice_digits || 3,
                    invoice_prefix: cRes.data.data.invoice_prefix || 'MZIINV',
                    invoice_next_number: cRes.data.data.invoice_next_number || 1,

                    quote_number_format: cRes.data.data.quote_number_format || '{NUMBER}/{PREFIX}/{MONTH}/{YEAR}',
                    quote_digits: cRes.data.data.quote_digits || 3,
                    quote_prefix: cRes.data.data.quote_prefix || 'QUO',
                    quote_next_number: cRes.data.data.quote_next_number || 1,

                    payment_number_format: cRes.data.data.payment_number_format || '{PREFIX}-{YEAR}-{NUMBER}',
                    payment_digits: cRes.data.data.payment_digits || 4,
                    payment_prefix: cRes.data.data.payment_prefix || 'PAY',
                    payment_next_number: cRes.data.data.payment_next_number || 1,

                    contract_prefix: cRes.data.data.contract_prefix || 'SPK-',
                    contract_next_number: cRes.data.data.contract_next_number || 1,
                    contract_number_format: cRes.data.data.contract_number_format || '{PREFIX}{YEAR}/{MONTH}/{NUMBER}',
                    contract_digits: cRes.data.data.contract_digits || 4,

                    payslip_prefix: cRes.data.data.payslip_prefix || 'SLIP/',
                    payslip_next_number: cRes.data.data.payslip_next_number || 1,
                    payslip_number_format: cRes.data.data.payslip_number_format || '{PREFIX}{YEAR}/{MONTH}/{NUMBER}',
                    payslip_digits: cRes.data.data.payslip_digits || 4,

                    payroll_cutoff_start_day: cRes.data.data.payroll_cutoff_start_day || 21,
                    payroll_cutoff_end_day: cRes.data.data.payroll_cutoff_end_day || 20,
                    payroll_late_deduction_type: cRes.data.data.payroll_late_deduction_type || 'FLAT_PER_OCCURRENCE',
                    payroll_late_deduction_rate: cRes.data.data.payroll_late_deduction_rate || 0,
                    payroll_absent_deduction_type: cRes.data.data.payroll_absent_deduction_type || 'PRORATA_BASE_SALARY',
                    payroll_absent_deduction_rate: cRes.data.data.payroll_absent_deduction_rate || 0,

                    overtime_calculation_type: cRes.data.data.overtime_calculation_type || 'FLAT_PER_HOUR',
                    overtime_flat_rate: cRes.data.data.overtime_flat_rate || 0,
                    overtime_multiplier: cRes.data.data.overtime_multiplier || 1.5,
                    overtime_work_hours_per_day: cRes.data.data.overtime_work_hours_per_day || 8,

                    do_show_receiver: cRes.data.data.do_show_receiver ?? true,
                    do_show_sender: cRes.data.data.do_show_sender ?? true,
                    do_show_driver: cRes.data.data.do_show_driver ?? false,
                    do_show_logistics: cRes.data.data.do_show_logistics ?? false,
                    do_show_manager: cRes.data.data.do_show_manager ?? false,
                    do_title_receiver: cRes.data.data.do_title_receiver || 'Penerima (Klien)',
                    do_title_sender: cRes.data.data.do_title_sender || 'Pengirim (Mikrotek)',
                    do_title_driver: cRes.data.data.do_title_driver || 'Pengemudi / Kurir',
                    do_title_logistics: cRes.data.data.do_title_logistics || 'Petugas Logistik',
                    do_title_manager: cRes.data.data.do_title_manager || 'Mengetahui (Manager)',
                });
            }
            setTaxRates(tRes.data.data || []);
            setPaymentMethods(pRes.data.data || []);
            setUsers(uRes.data.data || []);
            setDepartments(depRes.data.data || []);
            setPositions(posRes.data.data || []);
            setEmploymentStatuses(statusRes.data.data || []);
            setCompanyBankAccounts(bankRes.data.data || []);
            setReceiptTemplates(tmplRes.data.data || []);
            setInvoiceTemplates(invTmplRes.data.data || []);
            setQuoteTemplates(quoTmplRes.data.data || []);
            setContractTemplates(conTmplRes.data.data || []);
            setReimbursementCategories(reimbCatRes.data.data || []);
            setPayslipTemplates(payTmplRes.data.data || []);
            setDocumentTypes(docTypeRes.data.data || []);
        } catch (err) {
            console.error('Error loading settings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSaveCompany = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/settings', company);
            alert('Pengaturan profil perusahaan & SMTP berhasil disimpan!');
            fetchData();
        } catch (err) {
            alert('Gagal menyimpan pengaturan: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleTestSmtpSubmit = async (e) => {
        e.preventDefault();
        setTestingSmtp(true);
        try {
            const res = await api.post('/settings/smtp/test', { recipient_email: recipientEmail });
            alert(res.data.message || 'Email uji coba berhasil dikirim!');
            setShowSmtpModal(false);
        } catch (err) {
            alert('Gagal mengirim email uji coba: ' + (err.response?.data?.message || err.message));
        } finally {
            setTestingSmtp(false);
        }
    };

    // Bank Accounts Handlers
    const handleOpenBankModal = (bank = null) => {
        if (bank) {
            setEditingBank(bank);
            setBankForm({
                bank_name: bank.bank_name || 'Bank BCA',
                account_number: bank.account_number || '',
                account_holder: bank.account_holder || company.company_name || '',
                branch: bank.branch || '',
                swift_code: bank.swift_code || '',
                is_primary: bank.is_primary ?? false,
                is_active: bank.is_active ?? true,
            });
        } else {
            setEditingBank(null);
            setBankForm({
                bank_name: 'Bank BCA',
                account_number: '',
                account_holder: company.company_name || 'PT Mikrotek Zemiro Indonesia',
                branch: '',
                swift_code: '',
                is_primary: companyBankAccounts.length === 0,
                is_active: true,
            });
        }
        setShowBankModal(true);
    };

    const handleSaveBank = async (e) => {
        e.preventDefault();
        setSubmittingBank(true);
        try {
            if (editingBank) {
                await api.put(`/company-bank-accounts/${editingBank.id}`, bankForm);
                alert('Rekening bank berhasil diperbarui!');
            } else {
                await api.post('/company-bank-accounts', bankForm);
                alert('Rekening bank baru berhasil ditambahkan!');
            }
            setShowBankModal(false);
            fetchData();
        } catch (err) {
            alert('Gagal menyimpan rekening bank: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmittingBank(false);
        }
    };

    const handleSetPrimaryBank = async (bankId) => {
        try {
            await api.post(`/company-bank-accounts/${bankId}/set-primary`);
            fetchData();
        } catch (err) {
            alert('Gagal menjadikan rekening utama.');
        }
    };

    const handleDeleteBank = async (bankId) => {
        const ok = await confirm({
            title: 'Hapus Rekening Bank',
            message: 'Apakah Anda yakin ingin menghapus rekening bank perusahaan ini? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/company-bank-accounts/${bankId}`);
            fetchData();
        } catch (err) {
            alert('Gagal menghapus rekening bank.');
        }
    };

    // Tax Rates Handlers
    const handleOpenTaxModal = (tax = null) => {
        if (tax) {
            setEditingTax(tax);
            setTaxForm({
                name: tax.name || '',
                code: tax.code || '',
                percent: tax.percent ?? 11,
                is_active: tax.is_active ?? true,
            });
        } else {
            setEditingTax(null);
            setTaxForm({
                name: '',
                code: '',
                percent: 11,
                is_active: true,
            });
        }
        setShowTaxModal(true);
    };

    const handleSubmitTaxRate = async (e) => {
        e.preventDefault();
        setSubmittingTax(true);
        try {
            if (editingTax) {
                await api.put(`/tax-rates/${editingTax.id}`, taxForm);
                alert('Tarif pajak berhasil diperbarui!');
            } else {
                await api.post('/tax-rates', taxForm);
                alert('Tarif pajak baru berhasil ditambahkan!');
            }
            setShowTaxModal(false);
            fetchData();
        } catch (err) {
            alert('Gagal menyimpan tarif pajak: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmittingTax(false);
        }
    };

    const handleToggleTaxStatus = async (tax) => {
        try {
            await api.put(`/tax-rates/${tax.id}`, {
                name: tax.name,
                code: tax.code,
                percent: tax.percent,
                is_active: !tax.is_active,
            });
            fetchData();
        } catch (err) {
            alert('Gagal mengubah status tarif pajak.');
        }
    };

    const handleDeleteTaxRate = async (taxId) => {
        const ok = await confirm({
            title: 'Hapus Tarif Pajak',
            message: 'Apakah Anda yakin ingin menghapus tarif pajak ini? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/tax-rates/${taxId}`);
            alert('Tarif pajak berhasil dihapus.');
            fetchData();
        } catch (err) {
            alert('Gagal menghapus tarif pajak: ' + (err.response?.data?.message || err.message));
        }
    };

    // Payment Methods Handlers
    const handleOpenPaymentMethodModal = (method = null) => {
        if (method) {
            setEditingPaymentMethod(method);
            setPaymentMethodForm({
                name: method.name || '',
                code: method.code || '',
                description: method.description || '',
                is_active: method.is_active ?? true,
            });
        } else {
            setEditingPaymentMethod(null);
            setPaymentMethodForm({
                name: '',
                code: '',
                description: '',
                is_active: true,
            });
        }
        setShowPaymentMethodModal(true);
    };

    const handleSubmitPaymentMethod = async (e) => {
        e.preventDefault();
        setSubmittingPaymentMethod(true);
        try {
            if (editingPaymentMethod) {
                await api.put(`/payment-methods/${editingPaymentMethod.id}`, paymentMethodForm);
                alert('Metode pembayaran berhasil diperbarui!');
            } else {
                await api.post('/payment-methods', paymentMethodForm);
                alert('Metode pembayaran baru berhasil ditambahkan!');
            }
            setShowPaymentMethodModal(false);
            fetchData();
        } catch (err) {
            alert('Gagal menyimpan metode pembayaran: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmittingPaymentMethod(false);
        }
    };

    const handleTogglePaymentMethodStatus = async (method) => {
        try {
            await api.put(`/payment-methods/${method.id}`, {
                name: method.name,
                code: method.code,
                description: method.description,
                is_active: !method.is_active,
            });
            fetchData();
        } catch (err) {
            alert('Gagal mengubah status metode pembayaran.');
        }
    };

    const handleDeletePaymentMethod = async (methodId) => {
        const ok = await confirm({
            title: 'Hapus Metode Pembayaran',
            message: 'Apakah Anda yakin ingin menghapus metode pembayaran ini? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/payment-methods/${methodId}`);
            alert('Metode pembayaran berhasil dihapus.');
            fetchData();
        } catch (err) {
            alert('Gagal menghapus metode pembayaran: ' + (err.response?.data?.message || err.message));
        }
    };

    // Master HR Department Handlers
    const handleOpenDepModal = (dep = null) => {
        if (dep) {
            setEditingDep(dep);
            setDepForm({
                name: dep.name || '',
                code: dep.code || '',
                description: dep.description || '',
                is_active: dep.is_active ?? true,
            });
        } else {
            setEditingDep(null);
            setDepForm({
                name: '',
                code: '',
                description: '',
                is_active: true,
            });
        }
        setShowDepModal(true);
    };

    const handleSubmitDep = async (e) => {
        e.preventDefault();
        setSubmittingDep(true);
        try {
            if (editingDep) {
                await api.put(`/hr/departments/${editingDep.id}`, depForm);
                alert('Departemen berhasil diperbarui!');
            } else {
                await api.post('/hr/departments', depForm);
                alert('Departemen baru berhasil ditambahkan!');
            }
            setShowDepModal(false);
            fetchData();
        } catch (err) {
            alert('Gagal menyimpan departemen: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmittingDep(false);
        }
    };

    const handleToggleDepStatus = async (dep) => {
        try {
            await api.put(`/hr/departments/${dep.id}`, {
                name: dep.name,
                code: dep.code,
                description: dep.description,
                is_active: !dep.is_active,
            });
            fetchData();
        } catch (err) {
            alert('Gagal mengubah status departemen.');
        }
    };

    const handleDeleteDep = async (id) => {
        const ok = await confirm({
            title: 'Hapus Departemen',
            message: 'Apakah Anda yakin ingin menghapus departemen ini? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/hr/departments/${id}`);
            alert('Departemen berhasil dihapus.');
            fetchData();
        } catch (err) {
            alert('Gagal menghapus departemen: ' + (err.response?.data?.message || err.message));
        }
    };

    // Master HR Position Handlers
    const handleOpenPosModal = (pos = null) => {
        if (pos) {
            setEditingPos(pos);
            setPosForm({
                name: pos.name || '',
                code: pos.code || '',
                department_id: pos.department_id || '',
                description: pos.description || '',
                is_active: pos.is_active ?? true,
            });
        } else {
            setEditingPos(null);
            setPosForm({
                name: '',
                code: '',
                department_id: '',
                description: '',
                is_active: true,
            });
        }
        setShowPosModal(true);
    };

    const handleSubmitPos = async (e) => {
        e.preventDefault();
        setSubmittingPos(true);
        try {
            if (editingPos) {
                await api.put(`/hr/positions/${editingPos.id}`, posForm);
                alert('Jabatan berhasil diperbarui!');
            } else {
                await api.post('/hr/positions', posForm);
                alert('Jabatan baru berhasil ditambahkan!');
            }
            setShowPosModal(false);
            fetchData();
        } catch (err) {
            alert('Gagal menyimpan jabatan: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmittingPos(false);
        }
    };

    const handleTogglePosStatus = async (pos) => {
        try {
            await api.put(`/hr/positions/${pos.id}`, {
                name: pos.name,
                code: pos.code,
                department_id: pos.department_id,
                description: pos.description,
                is_active: !pos.is_active,
            });
            fetchData();
        } catch (err) {
            alert('Gagal mengubah status jabatan.');
        }
    };

    const handleDeletePos = async (id) => {
        const ok = await confirm({
            title: 'Hapus Jabatan',
            message: 'Apakah Anda yakin ingin menghapus jabatan ini? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/hr/positions/${id}`);
            alert('Jabatan berhasil dihapus.');
            fetchData();
        } catch (err) {
            alert('Gagal menghapus jabatan: ' + (err.response?.data?.message || err.message));
        }
    };

    // Master Document Types Handlers
    const handleOpenDocTypeModal = (dt = null) => {
        if (dt) {
            setEditingDocType(dt);
            setDocTypeForm({
                name: dt.name || '',
                code: dt.code || '',
                description: dt.description || '',
                is_active: dt.is_active ?? true,
            });
        } else {
            setEditingDocType(null);
            setDocTypeForm({
                name: '',
                code: '',
                description: '',
                is_active: true,
            });
        }
        setShowDocTypeModal(true);
    };

    const handleSubmitDocType = async (e) => {
        e.preventDefault();
        setSubmittingDocType(true);
        try {
            if (editingDocType) {
                await api.put(`/document-types/${editingDocType.id}`, docTypeForm);
                alert('Jenis dokumen berhasil diperbarui!');
            } else {
                await api.post('/document-types', docTypeForm);
                alert('Jenis dokumen baru berhasil ditambahkan!');
            }
            setShowDocTypeModal(false);
            fetchData();
        } catch (err) {
            alert('Gagal menyimpan jenis dokumen: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmittingDocType(false);
        }
    };

    const handleToggleDocTypeStatus = async (dt) => {
        try {
            await api.put(`/document-types/${dt.id}`, {
                name: dt.name,
                code: dt.code,
                description: dt.description,
                is_active: !dt.is_active,
            });
            fetchData();
        } catch (err) {
            alert('Gagal mengubah status jenis dokumen.');
        }
    };

    const handleDeleteDocType = async (id) => {
        const ok = await confirm({
            title: 'Hapus Jenis Dokumen',
            message: 'Apakah Anda yakin ingin menghapus jenis dokumen ini? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/document-types/${id}`);
            alert('Jenis dokumen berhasil dihapus.');
            fetchData();
        } catch (err) {
            alert('Gagal menghapus jenis dokumen: ' + (err.response?.data?.message || err.message));
        }
    };

    // Master HR Employment Status Handlers
    const handleOpenStatusModal = (st = null) => {
        if (st) {
            setEditingStatus(st);
            setStatusForm({
                name: st.name || '',
                code: st.code || '',
                description: st.description || '',
                is_active: st.is_active ?? true,
            });
        } else {
            setEditingStatus(null);
            setStatusForm({
                name: '',
                code: '',
                description: '',
                is_active: true,
            });
        }
        setShowStatusModal(true);
    };

    const handleSubmitStatus = async (e) => {
        e.preventDefault();
        setSubmittingStatus(true);
        try {
            if (editingStatus) {
                await api.put(`/hr/employment-statuses/${editingStatus.id}`, statusForm);
                alert('Status kerja berhasil diperbarui.');
            } else {
                await api.post('/hr/employment-statuses', statusForm);
                alert('Status kerja baru berhasil ditambahkan.');
            }
            setShowStatusModal(false);
            fetchData();
        } catch (err) {
            alert('Gagal menyimpan status kerja: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmittingStatus(false);
        }
    };

    const handleToggleEmploymentStatus = async (st) => {
        try {
            await api.put(`/hr/employment-statuses/${st.id}`, {
                ...st,
                is_active: !st.is_active,
            });
            fetchData();
        } catch (err) {
            alert('Gagal mengubah status aktif.');
        }
    };

    const handleDeleteStatus = async (id) => {
        const ok = await confirm({
            title: 'Hapus Status Kerja',
            message: 'Apakah Anda yakin ingin menghapus status kerja ini? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/hr/employment-statuses/${id}`);
            alert('Status kerja berhasil dihapus.');
            fetchData();
        } catch (err) {
            alert('Gagal menghapus status kerja: ' + (err.response?.data?.message || err.message));
        }
    };

    // Master Reimbursement Categories Handlers
    const handleOpenReimbCatModal = (cat = null) => {
        if (cat) {
            setEditingReimbCat(cat);
            setReimbCatForm({
                name: cat.name || '',
                code: cat.code || '',
                icon: cat.icon || '📝',
                max_limit: cat.max_limit || 0,
                description: cat.description || '',
                is_active: cat.is_active ?? true,
            });
        } else {
            setEditingReimbCat(null);
            setReimbCatForm({
                name: '',
                code: '',
                icon: '📝',
                max_limit: 0,
                description: '',
                is_active: true,
            });
        }
        setShowReimbCatModal(true);
    };

    const handleSubmitReimbCat = async (e) => {
        e.preventDefault();
        setSubmittingReimbCat(true);
        try {
            if (editingReimbCat) {
                await api.put(`/hr/reimbursement-categories/${editingReimbCat.id}`, reimbCatForm);
                alert('Kategori reimbursement berhasil diperbarui!');
            } else {
                await api.post('/hr/reimbursement-categories', reimbCatForm);
                alert('Kategori reimbursement baru berhasil ditambahkan!');
            }
            setShowReimbCatModal(false);
            fetchData();
        } catch (err) {
            alert('Gagal menyimpan kategori reimbursement: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmittingReimbCat(false);
        }
    };

    const handleToggleReimbCatStatus = async (cat) => {
        try {
            await api.put(`/hr/reimbursement-categories/${cat.id}`, {
                ...cat,
                is_active: !cat.is_active,
            });
            fetchData();
        } catch (err) {
            alert('Gagal mengubah status kategori.');
        }
    };

    const handleDeleteReimbCat = async (id) => {
        const ok = await confirm({
            title: 'Hapus Kategori Reimbursement',
            message: 'Apakah Anda yakin ingin menghapus kategori reimbursement ini? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/hr/reimbursement-categories/${id}`);
            alert('Kategori reimbursement berhasil dihapus.');
            fetchData();
        } catch (err) {
            alert('Gagal menghapus kategori reimbursement: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleUploadSignatureImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploadingSig(true);
        try {
            const res = await api.post('/settings/signature-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setCompany(prev => ({ ...prev, signature_image_path: res.data.data.signature_image_path }));
            alert('Gambar tanda tangan / stempel berhasil diunggah!');
        } catch (err) {
            alert('Gagal mengunggah gambar: ' + (err.response?.data?.message || err.message));
        } finally {
            setUploadingSig(false);
        }
    };

    const tabGroups = [
        {
            group: 'PROFIL & LEGALITAS',
            items: [
                { id: 'company',              label: 'Profil & Rekening Bank',         icon: Building },
                { id: 'attendance_location',  label: 'Lokasi & Zona Waktu',            icon: MapPin },
                { id: 'doc_numbering',        label: 'Format Nomor Dokumen',           icon: Hash },
                { id: 'signature',            label: 'Tanda Tangan & Legalisasi',      icon: ShieldCheck },
            ]
        },
        {
            group: 'INTEGRASI & DOKUMEN',
            items: [
                { id: 'smtp',             label: 'Konfigurasi SMTP Email',         icon: Mail },
                { id: 'webmail',          label: 'Pengaturan Webmail Client',      icon: Server },
                { id: 'registrar',        label: 'Registrar Domain',                icon: Globe },
                { id: 'receipt_template', label: 'Template Dokumen PDF',          icon: FileText },
                { id: 'delivery_order',   label: 'Pengaturan Surat Jalan',        icon: Truck },
            ]
        },
        {
            group: 'HR & KEPEGAWAIAN',
            items: [
                { id: 'departments',              label: 'Master Departemen',              icon: Layers },
                { id: 'positions',                label: 'Master Jabatan',                 icon: Briefcase },
                { id: 'employment_statuses',      label: 'Status Kerja',                   icon: UserCheck },
                { id: 'reimbursement_categories', label: 'Kategori Reimbursement',        icon: Receipt },
                { id: 'overtime',                 label: 'Pengaturan Uang Lembur',        icon: Clock },
            ]
        },
        {
            group: 'MASTER DATA & KEUANGAN',
            items: [
                { id: 'hosting_types',           label: 'Tipe & Provider Hosting',        icon: Server },
                { id: 'document_types',           label: 'Jenis Dokumen',                  icon: FolderKanban },
                { id: 'taxes',                    label: 'Master Tarif Pajak',             icon: Percent },
                { id: 'payments',                 label: 'Metode Pembayaran',              icon: CreditCard },
            ]
        },
        {
            group: 'SISTEM & INFORMASI',
            items: [
                { id: 'backup',               label: 'Backup & Safe Storage',          icon: Database },
                { id: 'about',                label: 'Tentang Aplikasi (About)',       icon: Info },
            ]
        }
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                        <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span>Pengaturan Sistem &amp; Master Data</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Konfigurasi profil usaha, rekening bank, format dokumen, server SMTP, &amp; master data.
                    </p>
                </div>
            </div>

            {/* Vertical Tab Layout Grid */}
            {loading ? (
                <div className="flex justify-center p-16 text-xs text-slate-500 dark:text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mr-2 text-blue-600 dark:text-blue-400" />
                    <span>Memuat data pengaturan...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Sidebar Vertical Tab Navigation */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm sticky top-6 space-y-4">
                            {tabGroups.map((group, gIdx) => (
                                <div key={gIdx} className="space-y-1">
                                    <h4 className="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                                        {group.group}
                                    </h4>
                                    <div className="space-y-1">
                                        {group.items.map((tab) => {
                                            const Icon = tab.icon;
                                            const active = activeTab === tab.id;
                                            return (
                                                <button
                                                    key={tab.id}
                                                    type="button"
                                                    onClick={() => setActiveTab(tab.id)}
                                                    className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-2.5 text-left ${
                                                        active
                                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-extrabold'
                                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-semibold'
                                                    }`}
                                                >
                                                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                                                    <span className="truncate">{tab.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel Main Tab Content */}
                    <div className="lg:col-span-9">
                        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm min-h-[550px]">
                    {/* Tab 1: Profil Perusahaan & Multi Rekening Bank */}
                    {activeTab === 'company' && (
                        <div className="space-y-8 max-w-3xl text-xs">
                            {/* Identitas Perusahaan */}
                            <form onSubmit={handleSaveCompany} className="space-y-4">
                                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-200 dark:border-slate-800">Identitas & Legalitas Perusahaan</h3>
                                
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nama Perusahaan (PT / CV / Firma) *</label>
                                    <input
                                        type="text"
                                        required
                                        value={company.company_name}
                                        onChange={(e) => setCompany({ ...company, company_name: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Email Resmi Perusahaan</label>
                                        <input
                                            type="email"
                                            value={company.company_email}
                                            onChange={(e) => setCompany({ ...company, company_email: e.target.value })}
                                            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">No. Telepon / Kantor</label>
                                        <input
                                            type="text"
                                            value={company.company_phone}
                                            onChange={(e) => setCompany({ ...company, company_phone: e.target.value })}
                                            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nomor NPWP Perusahaan</label>
                                    <input
                                        type="text"
                                        value={company.tax_number}
                                        onChange={(e) => setCompany({ ...company, tax_number: e.target.value })}
                                        placeholder="ex: 01.234.567.8-901.000"
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                                    />
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold flex items-center space-x-1.5 shadow-md shadow-blue-500/20">
                                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        <span>Simpan Profil Perusahaan</span>
                                    </button>
                                </div>
                            </form>

                            {/* Section Multi Rekening Bank Perusahaan */}
                            <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-emerald-500" />
                                            <span>Daftar Rekening Bank Perusahaan (Multi Accounts)</span>
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Perusahaan dapat menambah lebih dari 1 rekening bank untuk ditampilkan pada Invoice PDF & Client Portal.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleOpenBankModal()}
                                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1 shadow-sm"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Tambah Rekening Bank</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {companyBankAccounts.map((acc) => (
                                        <div
                                            key={acc.id}
                                            className={`p-4 rounded-xl border transition-all space-y-2 relative ${
                                                acc.is_primary
                                                    ? 'bg-emerald-500/5 border-emerald-500/30'
                                                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{acc.bank_name}</span>
                                                    {acc.is_primary && (
                                                        <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                                                            <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                                            <span>Rekening Utama</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenBankModal(acc)}
                                                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                                        title="Edit Rekening"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteBank(acc.id)}
                                                        className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                                                        title="Hapus Rekening"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="font-mono text-xs space-y-0.5">
                                                <p className="font-extrabold text-blue-600 dark:text-blue-400 text-sm">{acc.account_number}</p>
                                                <p className="text-slate-700 dark:text-slate-300">a/n {acc.account_holder}</p>
                                                {acc.branch && <p className="text-[11px] text-slate-500 font-sans">Cabang: {acc.branch}</p>}
                                            </div>

                                            {!acc.is_primary && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetPrimaryBank(acc.id)}
                                                    className="mt-2 text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1"
                                                >
                                                    <Star className="w-3 h-3" />
                                                    <span>Jadikan Rekening Utama</span>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab: Zona Waktu, Lokasi Kantor & Presensi GPS */}
                    {activeTab === 'attendance_location' && (
                        <div className="space-y-8 max-w-4xl text-xs">
                            <div>
                                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 pb-1 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span>Pengaturan Zona Waktu, Lokasi Kantor &amp; Presensi GPS</span>
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">
                                    Atur zona waktu resmi perusahaan untuk menyelaraskan jam server dan jam presensi karyawan, serta tentukan koordinat kantor pusat untuk validasi radius Clock In/Clock Out.
                                </p>
                            </div>

                            <form onSubmit={handleSaveCompany} className="space-y-6">
                                {/* 1. Zona Waktu Sistem */}
                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">1. Zona Waktu Perusahaan (Timezone)</h4>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Seluruh modul presensi, slip gaji, invoice, dan audit trail akan mengikuti zona waktu yang dipilih.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                                Pilih Zona Waktu Resmi
                                            </label>
                                            <select
                                                value={company.timezone || 'Asia/Jakarta'}
                                                onChange={(e) => setCompany({ ...company, timezone: e.target.value })}
                                                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500 text-xs"
                                            >
                                                <option value="Asia/Jakarta">WIB — Asia/Jakarta (Waktu Indonesia Barat, UTC+7)</option>
                                                <option value="Asia/Pontianak">WIB — Asia/Pontianak (Kalimantan Barat, UTC+7)</option>
                                                <option value="Asia/Makassar">WITA — Asia/Makassar (Waktu Indonesia Tengah, UTC+8)</option>
                                                <option value="Asia/Bali">WITA — Asia/Bali (Denpasar, UTC+8)</option>
                                                <option value="Asia/Jayapura">WIT — Asia/Jayapura (Waktu Indonesia Timur, UTC+9)</option>
                                                <option value="Asia/Singapore">SGT — Asia/Singapore (Singapore / Malaysia, UTC+8)</option>
                                                <option value="Asia/Bangkok">ICT — Asia/Bangkok (Thailand / Indochina, UTC+7)</option>
                                                <option value="UTC">UTC — Greenwich Mean Time (Coordinated Universal Time, UTC+0)</option>
                                            </select>
                                        </div>

                                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Waktu Server Berdasarkan Timezone Terpilih</span>
                                            <div className="text-lg font-mono font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                                                {new Date().toLocaleTimeString('id-ID', { timeZone: company.timezone || 'Asia/Jakarta' })} <span className="text-xs text-slate-500 font-normal">({company.timezone || 'Asia/Jakarta'})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Jadwal & Toleransi Jam Kerja */}
                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">2. Jam Kerja Standar &amp; Toleransi Keterlambatan</h4>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Digunakan untuk menentukan status kehadiran (Hadir Tepat Waktu vs Terlambat / LATE) saat karyawan Clock In.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                                Jam Masuk Kerja (Start Time)
                                            </label>
                                            <input
                                                type="time"
                                                value={company.work_start_time ? company.work_start_time.substring(0, 5) : '08:30'}
                                                onChange={(e) => setCompany({ ...company, work_start_time: e.target.value + ':00' })}
                                                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500 text-xs"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                                Jam Pulang Kerja (End Time)
                                            </label>
                                            <input
                                                type="time"
                                                value={company.work_end_time ? company.work_end_time.substring(0, 5) : '17:30'}
                                                onChange={(e) => setCompany({ ...company, work_end_time: e.target.value + ':00' })}
                                                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500 text-xs"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                                Toleransi Terlambat (Menit)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="180"
                                                value={company.late_tolerance_minutes ?? 15}
                                                onChange={(e) => setCompany({ ...company, late_tolerance_minutes: parseInt(e.target.value) || 0 })}
                                                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500 text-xs"
                                            />
                                            <span className="text-[10px] text-slate-400 mt-1 block">Clock in setelah jam masuk + toleransi akan ditandai LATE.</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Koordinat GPS Kantor & Geofencing */}
                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">3. Koordinat Lokasi Kantor &amp; Radius Presensi (Geofencing)</h4>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400">Tentukan titik pusat kantor agar sistem dapat mendeteksi jarak presensi karyawan.</p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleGetCurrentLocation}
                                            disabled={gettingLocation}
                                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 transition-all self-start sm:self-auto"
                                        >
                                            {gettingLocation ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                                            <span>Ambil GPS Browser Saat Ini</span>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                                Latitude Kantor
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                placeholder="-6.2088"
                                                value={company.office_latitude ?? ''}
                                                onChange={(e) => setCompany({ ...company, office_latitude: parseFloat(e.target.value) || null })}
                                                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500 text-xs font-mono"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                                Longitude Kantor
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                placeholder="106.8456"
                                                value={company.office_longitude ?? ''}
                                                onChange={(e) => setCompany({ ...company, office_longitude: parseFloat(e.target.value) || null })}
                                                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500 text-xs font-mono"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                                Radius Izin Presensi (Meter)
                                            </label>
                                            <input
                                                type="number"
                                                min="10"
                                                max="50000"
                                                placeholder="100"
                                                value={company.office_radius_meters ?? 100}
                                                onChange={(e) => setCompany({ ...company, office_radius_meters: parseInt(e.target.value) || 100 })}
                                                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500 text-xs font-mono"
                                            />
                                        </div>
                                    </div>

                                    {/* Toggle Wajib Geofencing */}
                                    <div className="pt-2">
                                        <label className="flex items-start space-x-3 p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-blue-500/40 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={!!company.require_location_check}
                                                onChange={(e) => setCompany({ ...company, require_location_check: e.target.checked })}
                                                className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                            />
                                            <div>
                                                <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs">Wajibkan Validasi Radius GPS Saat Presensi (Strict Geofencing)</span>
                                                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                                                    Jika diaktifkan, karyawan yang berada di luar radius kantor ({company.office_radius_meters || 100} meter) atau tidak mengizinkan akses GPS akan ditolak saat Clock In / Clock Out.
                                                </span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="pt-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
                                    >
                                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        <span>Simpan Pengaturan Lokasi &amp; Zona Waktu</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Tab Format Nomor Dokumen */}
                    {activeTab === 'doc_numbering' && (
                        <div className="space-y-6 max-w-4xl text-xs">
                            <form onSubmit={handleSaveCompany} className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 pb-1 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                                        <Hash className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        <span>Konfigurasi Format &amp; Penomoran Dokumen</span>
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                                        Atur pola format nomor otomatis untuk Penawaran (Quote), Invoice, dan Kwitansi Pembayaran. Anda bebas menentukan urutan pola, teks awalan (prefix), dan angka awal mulainya penomoran.
                                    </p>
                                </div>

                                {/* Panduan Tag Variabel & Preset */}
                                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                                            <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            <span>Panduan Dynamic Tags &amp; Preset Pola Penomoran</span>
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 font-mono text-[11px]">
                                        <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                            <span className="font-bold text-blue-600 dark:text-blue-400 block">{`{NUMBER}`}</span>
                                            <span className="text-[10px] text-slate-400 font-sans">No. Urut (001)</span>
                                        </div>
                                        <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                            <span className="font-bold text-blue-600 dark:text-blue-400 block">{`{PREFIX}`}</span>
                                            <span className="text-[10px] text-slate-400 font-sans">Kode Awalan</span>
                                        </div>
                                        <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                            <span className="font-bold text-blue-600 dark:text-blue-400 block">{`{YEAR}`}</span>
                                            <span className="text-[10px] text-slate-400 font-sans">Tahun (2026)</span>
                                        </div>
                                        <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                            <span className="font-bold text-blue-600 dark:text-blue-400 block">{`{YY}`}</span>
                                            <span className="text-[10px] text-slate-400 font-sans">Tahun singkat (26)</span>
                                        </div>
                                        <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                            <span className="font-bold text-blue-600 dark:text-blue-400 block">{`{MONTH}`}</span>
                                            <span className="text-[10px] text-slate-400 font-sans">Bulan (09)</span>
                                        </div>
                                        <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                            <span className="font-bold text-blue-600 dark:text-blue-400 block">{`{DAY}`}</span>
                                            <span className="text-[10px] text-slate-400 font-sans">Tanggal (22)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 1: PENAWARAN (QUOTE) */}
                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                            <span>Penawaran Harga (Quote)</span>
                                        </h4>
                                        <div className="text-[11px] font-semibold text-slate-500">
                                            Pratinjau Hasil: <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-blue-500/20">{previewDocumentNumber(company.quote_number_format, company.quote_prefix, company.quote_next_number, company.quote_digits)}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                                Format Pola Penomoran Quote *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={company.quote_number_format}
                                                onChange={(e) => setCompany({ ...company, quote_number_format: e.target.value })}
                                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                                Prefix / Awalan *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={company.quote_prefix}
                                                onChange={(e) => setCompany({ ...company, quote_prefix: e.target.value })}
                                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                                Urutan Berikuntya *
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                value={company.quote_next_number}
                                                onChange={(e) => setCompany({ ...company, quote_next_number: parseInt(e.target.value) || 1 })}
                                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                                Digit Pad (Lebar Seri) *
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="10"
                                                required
                                                value={company.quote_digits}
                                                onChange={(e) => setCompany({ ...company, quote_digits: parseInt(e.target.value) || 3 })}
                                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 2: INVOICE & TAGIHAN */}
                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            <span>Invoice &amp; Tagihan</span>
                                        </h4>
                                        <div className="text-[11px] font-semibold text-slate-500">
                                            Pratinjau Hasil: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-emerald-500/20">{previewDocumentNumber(company.invoice_number_format, company.invoice_prefix, company.invoice_next_number, company.invoice_digits)}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                                Format Pola Penomoran Invoice *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={company.invoice_number_format}
                                                onChange={(e) => setCompany({ ...company, invoice_number_format: e.target.value })}
                                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                                Prefix / Awalan *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={company.invoice_prefix}
                                                onChange={(e) => setCompany({ ...company, invoice_prefix: e.target.value })}
                                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                                Urutan Berikutnya *
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                value={company.invoice_next_number}
                                                onChange={(e) => setCompany({ ...company, invoice_next_number: parseInt(e.target.value) || 1 })}
                                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                                Digit Pad (Lebar Seri) *
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="10"
                                                required
                                                value={company.invoice_digits}
                                                onChange={(e) => setCompany({ ...company, invoice_digits: parseInt(e.target.value) || 3 })}
                                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 3: PEMBAYARAN & KWITANSI */}
                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            <span>Kwitansi Pembayaran (Payment)</span>
                                        </h4>
                                        <div className="text-[11px] font-semibold text-slate-500">
                                            Pratinjau Hasil: <span className="font-mono font-bold text-purple-600 dark:text-purple-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-purple-500/20">{previewDocumentNumber(company.payment_number_format, company.payment_prefix, company.payment_next_number, company.payment_digits)}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                                Format Pola Penomoran Kwitansi *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="{PREFIX}-{YEAR}-{NUMBER}"
                                                value={company.payment_number_format || ''}
                                                onChange={(e) => setCompany({ ...company, payment_number_format: e.target.value })}
                                                className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                                Prefix Awalan Teks (Opsional)
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="PAY / KWT (Kosongkan jika tanpa prefix)"
                                                value={company.payment_prefix || ''}
                                                onChange={(e) => setCompany({ ...company, payment_prefix: e.target.value })}
                                                className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                                No. Urut Berikutnya (Start) *
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                value={company.payment_next_number || 1}
                                                onChange={(e) => setCompany({ ...company, payment_next_number: parseInt(e.target.value) || 1 })}
                                                className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <span className="text-[11px] font-semibold text-slate-500">Jumlah Digit Padding Zero:</span>
                                        {[3, 4, 5].map((d) => (
                                            <button
                                                key={d}
                                                type="button"
                                                onClick={() => setCompany({ ...company, payment_digits: d })}
                                                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                                                    (company.payment_digits || 4) === d
                                                        ? 'bg-purple-600 text-white shadow-sm'
                                                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                                                }`}
                                            >
                                                {d} Digit ({String(company.payment_next_number || 1).padStart(d, '0')})
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* SECTION 4: SURAT KONTRAK KERJA */}
                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            <span>Surat Kontrak Kerja (Contract)</span>
                                        </h4>
                                        <div className="text-[11px] font-semibold text-slate-500">
                                            Pratinjau Hasil: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-emerald-500/20">{previewDocumentNumber(company.contract_number_format, company.contract_prefix, company.contract_next_number, company.contract_digits)}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="block font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                                                Format Pola Penomoran Kontrak *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="{PREFIX}{YEAR}/{MONTH}/{NUMBER}"
                                                value={company.contract_number_format || ''}
                                                onChange={(e) => setCompany({ ...company, contract_number_format: e.target.value })}
                                                className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="block font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                                                Prefix Awalan Teks (Opsional)
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="SPK / KTR (Kosongkan jika tanpa prefix)"
                                                value={company.contract_prefix || ''}
                                                onChange={(e) => setCompany({ ...company, contract_prefix: e.target.value })}
                                                className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="block font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                                                No. Urut Berikutnya (Start) *
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                value={company.contract_next_number || 1}
                                                onChange={(e) => setCompany({ ...company, contract_next_number: parseInt(e.target.value) || 1 })}
                                                className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <span className="text-[11px] font-semibold text-slate-500">Jumlah Digit Padding Zero:</span>
                                        {[3, 4, 5].map((d) => (
                                            <button
                                                key={d}
                                                type="button"
                                                onClick={() => setCompany({ ...company, contract_digits: d })}
                                                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                                                    (company.contract_digits || 4) === d
                                                        ? 'bg-emerald-600 text-white shadow-sm'
                                                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                                                }`}
                                            >
                                                {d} Digit ({String(company.contract_next_number || 1).padStart(d, '0')})
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* SECTION 5: SLIP GAJI KARYAWAN (PAYSLIP) */}
                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                            <Banknote className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                            <span>Slip Gaji Karyawan (Payslip)</span>
                                        </h4>
                                        <div className="text-[11px] font-semibold text-slate-500">
                                            Pratinjau Hasil: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-indigo-500/20">{previewDocumentNumber(company.payslip_number_format, company.payslip_prefix, company.payslip_next_number, company.payslip_digits)}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="block font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                                                Format Pola Penomoran Slip Gaji *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="{PREFIX}{YEAR}/{MONTH}/{NUMBER}"
                                                value={company.payslip_number_format || ''}
                                                onChange={(e) => setCompany({ ...company, payslip_number_format: e.target.value })}
                                                className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="block font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                                                Prefix Awalan Teks (Opsional)
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="SLIP/ (Kosongkan jika tanpa prefix)"
                                                value={company.payslip_prefix || ''}
                                                onChange={(e) => setCompany({ ...company, payslip_prefix: e.target.value })}
                                                className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="block font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                                                No. Urut Berikutnya (Start) *
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                value={company.payslip_next_number || 1}
                                                onChange={(e) => setCompany({ ...company, payslip_next_number: parseInt(e.target.value) || 1 })}
                                                className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <span className="text-[11px] font-semibold text-slate-500">Jumlah Digit Padding Zero:</span>
                                        {[3, 4, 5].map((d) => (
                                            <button
                                                key={d}
                                                type="button"
                                                onClick={() => setCompany({ ...company, payslip_digits: d })}
                                                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                                                    (company.payslip_digits || 4) === d
                                                        ? 'bg-indigo-600 text-white shadow-sm'
                                                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                                                }`}
                                            >
                                                {d} Digit ({String(company.payslip_next_number || 1).padStart(d, '0')})
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center space-x-2 shadow-md shadow-blue-500/20 transition-all disabled:opacity-60 text-xs"
                                    >
                                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        <span>Simpan Format Penomoran</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Tab Pengaturan Uang Lembur */}
                    {activeTab === 'overtime' && (
                        <div className="space-y-6 max-w-3xl text-xs">
                            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-orange-500" />
                                    <span>Pengaturan Uang Lembur &amp; Tarif Upah</span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Aturan ini digunakan saat kalkulasi payroll untuk menghitung kompensasi uang lembur dari pengajuan lembur yang telah disetujui.
                                </p>
                            </div>

                            <form onSubmit={handleSaveCompany} className="space-y-6">
                                <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                                    {/* Metode Hitung */}
                                    <div className="space-y-2">
                                        <label className="block font-semibold text-slate-700 dark:text-slate-300 text-xs">Metode Perhitungan Uang Lembur *</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div
                                                onClick={() => setCompany({ ...company, overtime_calculation_type: 'FLAT_PER_HOUR' })}
                                                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                                    company.overtime_calculation_type === 'FLAT_PER_HOUR'
                                                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20 shadow-sm ring-1 ring-orange-500/30'
                                                        : 'border-slate-200 dark:border-slate-800 hover:border-orange-300'
                                                }`}
                                            >
                                                <div className="font-bold text-slate-900 dark:text-slate-100 text-xs mb-1">Tarif Flat per Jam</div>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400">Upah lembur = total jam lembur × tarif tetap per jam.</p>
                                            </div>
                                            <div
                                                onClick={() => setCompany({ ...company, overtime_calculation_type: 'MULTIPLIER_HOURLY_RATE' })}
                                                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                                    company.overtime_calculation_type === 'MULTIPLIER_HOURLY_RATE'
                                                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20 shadow-sm ring-1 ring-orange-500/30'
                                                        : 'border-slate-200 dark:border-slate-800 hover:border-orange-300'
                                                }`}
                                            >
                                                <div className="font-bold text-slate-900 dark:text-slate-100 text-xs mb-1">Kelipatan Upah per Jam Normal</div>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400">Upah lembur = jam lembur × (gaji pokok ÷ hari kerja ÷ jam/hari) × kelipatan.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Conditional inputs */}
                                    {company.overtime_calculation_type === 'FLAT_PER_HOUR' ? (
                                        <div className="space-y-1.5 pt-2">
                                            <label className="block font-semibold text-slate-700 dark:text-slate-300 text-xs">
                                                Tarif Flat per Jam (Rp)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="1000"
                                                placeholder="Contoh: 50000"
                                                value={company.overtime_flat_rate || 0}
                                                onChange={(e) => setCompany({ ...company, overtime_flat_rate: parseFloat(e.target.value) || 0 })}
                                                className="w-full max-w-xs px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                                            />
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Misal: 50.000 → 3 jam lembur = Rp 150.000</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                            <div className="space-y-1.5">
                                                <label className="block font-semibold text-slate-700 dark:text-slate-300 text-xs">Kelipatan (Multiplier)</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="5"
                                                    step="0.25"
                                                    placeholder="1.5"
                                                    value={company.overtime_multiplier || 1.5}
                                                    onChange={(e) => setCompany({ ...company, overtime_multiplier: parseFloat(e.target.value) || 1.5 })}
                                                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                                                />
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400">Standar depnaker: 1.5x (hari kerja), 2x (hari libur)</p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="block font-semibold text-slate-700 dark:text-slate-300 text-xs">Jam Kerja Standar per Hari</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="24"
                                                    placeholder="8"
                                                    value={company.overtime_work_hours_per_day || 8}
                                                    onChange={(e) => setCompany({ ...company, overtime_work_hours_per_day: parseInt(e.target.value) || 8 })}
                                                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                                                />
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400">Digunakan untuk menghitung upah per jam (default: 8 jam)</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center space-x-2 shadow-md shadow-blue-500/20 transition-all disabled:opacity-60 text-xs"
                                    >
                                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        <span>Simpan Pengaturan Lembur</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}


                    {/* Tab Pengaturan Surat Jalan (Delivery Order) */}
                    {activeTab === 'delivery_order' && (
                        <div className="space-y-6 max-w-3xl text-xs">
                            <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        <span>Pengaturan Layout &amp; Tanda Tangan Surat Jalan</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Kustomisasi kolom tanda tangan resmi pada cetakan PDF Surat Jalan (Delivery Order).
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setCompany({
                                            ...company,
                                            do_show_sender: true,
                                            do_show_receiver: true,
                                            do_show_driver: false,
                                            do_show_logistics: false,
                                            do_show_manager: false,
                                            do_title_sender: 'Pengirim (Mikrotek)',
                                            do_title_receiver: 'Penerima (Klien)',
                                        })}
                                        className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 text-[11px] font-bold border border-blue-200 dark:border-blue-800 transition-all"
                                    >
                                        Preset Mikrotek (2 Kolom)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCompany({
                                            ...company,
                                            do_show_sender: true,
                                            do_show_receiver: true,
                                            do_show_driver: true,
                                            do_show_logistics: true,
                                            do_show_manager: true,
                                            do_title_sender: 'Pengirim',
                                            do_title_receiver: 'Penerima (Klien)',
                                            do_title_driver: 'Pengemudi / Kurir',
                                            do_title_logistics: 'Petugas Logistik',
                                            do_title_manager: 'Mengetahui (Manager)',
                                        })}
                                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-bold border border-slate-300 dark:border-slate-700 transition-all"
                                    >
                                        Preset Lengkap (5 Kolom)
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSaveCompany} className="space-y-6">
                                <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 tracking-tight">
                                        Pilih Kolom Tanda Tangan Yang Ditampilkan di PDF:
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* 1. Pengirim (Mikrotek) */}
                                        <div className={`p-4 rounded-xl border transition-all ${
                                            company.do_show_sender
                                                ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20'
                                                : 'border-slate-200 dark:border-slate-800 opacity-60'
                                        }`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="flex items-center space-x-2 font-bold text-xs text-slate-900 dark:text-slate-100 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={company.do_show_sender ?? true}
                                                        onChange={(e) => setCompany({ ...company, do_show_sender: e.target.checked })}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                    <span>Kolom Pengirim (Mikrotek)</span>
                                                </label>
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold">Mikrotek Flow</span>
                                            </div>
                                            <input
                                                type="text"
                                                disabled={!company.do_show_sender}
                                                placeholder="Judul Kolom (cth: Pengirim (Mikrotek))"
                                                value={company.do_title_sender || ''}
                                                onChange={(e) => setCompany({ ...company, do_title_sender: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                            />
                                        </div>

                                        {/* 2. Penerima (Klien) */}
                                        <div className={`p-4 rounded-xl border transition-all ${
                                            company.do_show_receiver
                                                ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20'
                                                : 'border-slate-200 dark:border-slate-800 opacity-60'
                                        }`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="flex items-center space-x-2 font-bold text-xs text-slate-900 dark:text-slate-100 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={company.do_show_receiver ?? true}
                                                        onChange={(e) => setCompany({ ...company, do_show_receiver: e.target.checked })}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                    <span>Kolom Penerima (Klien)</span>
                                                </label>
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold">Penerima Lokasi</span>
                                            </div>
                                            <input
                                                type="text"
                                                disabled={!company.do_show_receiver}
                                                placeholder="Judul Kolom (cth: Penerima (Klien))"
                                                value={company.do_title_receiver || ''}
                                                onChange={(e) => setCompany({ ...company, do_title_receiver: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                            />
                                        </div>

                                        {/* 3. Pengemudi / Sopir */}
                                        <div className={`p-4 rounded-xl border transition-all ${
                                            company.do_show_driver
                                                ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20'
                                                : 'border-slate-200 dark:border-slate-800 opacity-60'
                                        }`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="flex items-center space-x-2 font-bold text-xs text-slate-900 dark:text-slate-100 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={company.do_show_driver ?? false}
                                                        onChange={(e) => setCompany({ ...company, do_show_driver: e.target.checked })}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                    <span>Kolom Pengemudi / Kurir</span>
                                                </label>
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">Opsional</span>
                                            </div>
                                            <input
                                                type="text"
                                                disabled={!company.do_show_driver}
                                                placeholder="Judul Kolom (cth: Pengemudi / Kurir)"
                                                value={company.do_title_driver || ''}
                                                onChange={(e) => setCompany({ ...company, do_title_driver: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                            />
                                        </div>

                                        {/* 4. Petugas Logistik */}
                                        <div className={`p-4 rounded-xl border transition-all ${
                                            company.do_show_logistics
                                                ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20'
                                                : 'border-slate-200 dark:border-slate-800 opacity-60'
                                        }`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="flex items-center space-x-2 font-bold text-xs text-slate-900 dark:text-slate-100 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={company.do_show_logistics ?? false}
                                                        onChange={(e) => setCompany({ ...company, do_show_logistics: e.target.checked })}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                    <span>Kolom Petugas Logistik</span>
                                                </label>
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">Opsional</span>
                                            </div>
                                            <input
                                                type="text"
                                                disabled={!company.do_show_logistics}
                                                placeholder="Judul Kolom (cth: Petugas Logistik)"
                                                value={company.do_title_logistics || ''}
                                                onChange={(e) => setCompany({ ...company, do_title_logistics: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                            />
                                        </div>

                                        {/* 5. Mengetahui Manager */}
                                        <div className={`p-4 rounded-xl border transition-all md:col-span-2 ${
                                            company.do_show_manager
                                                ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20'
                                                : 'border-slate-200 dark:border-slate-800 opacity-60'
                                        }`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="flex items-center space-x-2 font-bold text-xs text-slate-900 dark:text-slate-100 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={company.do_show_manager ?? false}
                                                        onChange={(e) => setCompany({ ...company, do_show_manager: e.target.checked })}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                    <span>Kolom Mengetahui (Manager / Atasan)</span>
                                                </label>
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">Opsional</span>
                                            </div>
                                            <input
                                                type="text"
                                                disabled={!company.do_show_manager}
                                                placeholder="Judul Kolom (cth: Mengetahui (Manager))"
                                                value={company.do_title_manager || ''}
                                                onChange={(e) => setCompany({ ...company, do_title_manager: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                            />
                                        </div>
                                    </div>

                                    {/* Preview Layout Kolom */}
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                                        <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                                            Simulasi Layout Tanda Tangan PDF (Lebar Otomatis Terbagi):
                                        </div>
                                        <div className="grid grid-cols-2 md:flex md:divide-x divide-slate-200 dark:divide-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-950 text-center font-mono">
                                            {company.do_show_sender && (
                                                <div className="p-3 flex-1">
                                                    <div className="font-bold text-[10px] text-blue-600 dark:text-blue-400 uppercase">{company.do_title_sender || 'Pengirim'}</div>
                                                    <div className="h-10 border-b border-dashed border-slate-300 dark:border-slate-700 my-2"></div>
                                                    <div className="text-[10px] text-slate-500">( {company.company_name || 'Mikrotek'} )</div>
                                                </div>
                                            )}
                                            {company.do_show_receiver && (
                                                <div className="p-3 flex-1">
                                                    <div className="font-bold text-[10px] text-emerald-600 dark:text-emerald-400 uppercase">{company.do_title_receiver || 'Penerima'}</div>
                                                    <div className="h-10 border-b border-dashed border-slate-300 dark:border-slate-700 my-2"></div>
                                                    <div className="text-[10px] text-slate-500">( Nama Penerima )</div>
                                                </div>
                                            )}
                                            {company.do_show_driver && (
                                                <div className="p-3 flex-1">
                                                    <div className="font-bold text-[10px] text-purple-600 dark:text-purple-400 uppercase">{company.do_title_driver || 'Pengemudi'}</div>
                                                    <div className="h-10 border-b border-dashed border-slate-300 dark:border-slate-700 my-2"></div>
                                                    <div className="text-[10px] text-slate-500">( Sopir / Kurir )</div>
                                                </div>
                                            )}
                                            {company.do_show_logistics && (
                                                <div className="p-3 flex-1">
                                                    <div className="font-bold text-[10px] text-amber-600 dark:text-amber-400 uppercase">{company.do_title_logistics || 'Logistik'}</div>
                                                    <div className="h-10 border-b border-dashed border-slate-300 dark:border-slate-700 my-2"></div>
                                                    <div className="text-[10px] text-slate-500">( Petugas Gudang )</div>
                                                </div>
                                            )}
                                            {company.do_show_manager && (
                                                <div className="p-3 flex-1">
                                                    <div className="font-bold text-[10px] text-rose-600 dark:text-rose-400 uppercase">{company.do_title_manager || 'Manager'}</div>
                                                    <div className="h-10 border-b border-dashed border-slate-300 dark:border-slate-700 my-2"></div>
                                                    <div className="text-[10px] text-slate-500">( Manager Logistik )</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center space-x-2 shadow-md shadow-blue-500/20 transition-all disabled:opacity-60 text-xs"
                                    >
                                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        <span>Simpan Pengaturan Surat Jalan</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    {activeTab === 'signature' && (
                        <div className="space-y-6 max-w-3xl text-xs">
                            <form onSubmit={handleSaveCompany} className="space-y-5">
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 pb-1 border-b border-slate-200 dark:border-slate-800">
                                        Legalisasi & Mode Tanda Tangan Dokumen PDF
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                                        Pilih mode tanda tangan default untuk pencetakan dokumen PDF Invoice & Penawaran (Quote).
                                    </p>
                                </div>

                                {/* Mode Tanda Tangan Options */}
                                <div className="space-y-3">
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold">Pilih Mode Tanda Tangan Default *</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div
                                            onClick={() => setCompany({ ...company, signature_type: 'QR_CODE' })}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                                company.signature_type === 'QR_CODE'
                                                    ? 'border-blue-600 bg-blue-500/10 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20 font-bold'
                                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-900'
                                            }`}
                                        >
                                            <div className="mb-2">
                                                <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="font-bold text-slate-900 dark:text-slate-100">Signature QR Code</div>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Verifikasi digital otomatis via QR Code unik di lembar PDF.</p>
                                        </div>

                                        <div
                                            onClick={() => setCompany({ ...company, signature_type: 'IMAGE' })}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                                company.signature_type === 'IMAGE'
                                                    ? 'border-blue-600 bg-blue-500/10 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20 font-bold'
                                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-900'
                                            }`}
                                        >
                                            <div className="mb-2">
                                                <Image className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div className="font-bold text-slate-900 dark:text-slate-100">Signature Image</div>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Menggunakan file gambar TTD &amp; Stempel yang diunggah.</p>
                                        </div>

                                        <div
                                            onClick={() => setCompany({ ...company, signature_type: 'MANUAL' })}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                                company.signature_type === 'MANUAL'
                                                    ? 'border-blue-600 bg-blue-500/10 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20 font-bold'
                                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-900'
                                            }`}
                                        >
                                            <div className="mb-2">
                                                <PenTool className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div className="font-bold text-slate-900 dark:text-slate-100">Signature Manual</div>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Kotak area kosong resmi bergaris untuk TTD &amp; stempel basah.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Upload Image Field if IMAGE selected or generally available */}
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold">Upload Gambar Tanda Tangan & Stempel (PNG / JPG)</label>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                                        {company.signature_image_path ? (
                                            <div className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shrink-0">
                                                <img src={company.signature_image_path} alt="Signature Preview" className="h-16 object-contain" />
                                            </div>
                                        ) : (
                                            <div className="w-32 h-16 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] text-slate-400 italic shrink-0">
                                                Belum ada gambar
                                            </div>
                                        )}

                                        <div className="space-y-1">
                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                                onChange={handleUploadSignatureImage}
                                                disabled={uploadingSig}
                                                className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                                            />
                                            <p className="text-[10px] text-slate-400">Rekomendasi: Format PNG transparan (background bening) / JPG max 2MB.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Signer Identity Details */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nama Penanda Tangan (Signer Name)</label>
                                        <input
                                            type="text"
                                            value={company.signature_signer_name || ''}
                                            onChange={(e) => setCompany({ ...company, signature_signer_name: e.target.value })}
                                            placeholder="ex: Budi Santoso, S.Kom"
                                            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Jabatan / Gelar (Signer Title)</label>
                                        <input
                                            type="text"
                                            value={company.signature_signer_title || ''}
                                            onChange={(e) => setCompany({ ...company, signature_signer_title: e.target.value })}
                                            placeholder="ex: Direktur Utama / Finance Manager"
                                            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
                                >
                                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    <span>Simpan Pengaturan Legalisasi</span>
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Tab 2: Konfigurasi SMTP & Email */}
                    {activeTab === 'smtp' && (
                        <form onSubmit={handleSaveCompany} className="space-y-4 max-w-3xl text-xs">
                            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        <span>Konfigurasi SMTP Server & Pengiriman Email</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Pengaturan server mailer untuk pengiriman Invoice, Slip Gaji, & Pengingat otomatis via Email.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRecipientEmail(user?.email || company.company_email || 'test@mikrotek.id');
                                        setShowSmtpModal(true);
                                    }}
                                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Tes Koneksi Email</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Driver Protocol *</label>
                                    <SearchableSelect
                                        options={[
                                            { value: 'smtp', label: 'SMTP (Recommended)' },
                                            { value: 'sendmail', label: 'Sendmail' },
                                            { value: 'log', label: 'Log File (Development/Testing)' },
                                        ]}
                                        value={company.mail_mailer}
                                        onChange={(val) => setCompany({ ...company, mail_mailer: val })}
                                        placeholder="Pilih Driver..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Enkripsi Security *</label>
                                    <SearchableSelect
                                        options={[
                                            { value: 'tls', label: 'TLS (Port 587)' },
                                            { value: 'ssl', label: 'SSL (Port 465)' },
                                            { value: 'none', label: 'Tanpa Enkripsi (Port 25)' },
                                        ]}
                                        value={company.mail_encryption}
                                        onChange={(val) => setCompany({ ...company, mail_encryption: val })}
                                        placeholder="Pilih Enkripsi..."
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">SMTP Host Server *</label>
                                    <input
                                        type="text"
                                        required
                                        value={company.mail_host}
                                        onChange={(e) => setCompany({ ...company, mail_host: e.target.value })}
                                        placeholder="ex: smtp.gmail.com / smtp.mailgun.org"
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Port Server *</label>
                                    <input
                                        type="number"
                                        required
                                        value={company.mail_port}
                                        onChange={(e) => setCompany({ ...company, mail_port: e.target.value })}
                                        placeholder="587"
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Username / Email Login SMTP</label>
                                    <input
                                        type="text"
                                        value={company.mail_username}
                                        onChange={(e) => setCompany({ ...company, mail_username: e.target.value })}
                                        placeholder="user@domain.com"
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Password / App Password SMTP</label>
                                    <input
                                        type="password"
                                        value={company.mail_password}
                                        onChange={(e) => setCompany({ ...company, mail_password: e.target.value })}
                                        placeholder="••••••••••••••••"
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Alamat Email Pengirim (From Address)</label>
                                    <input
                                        type="email"
                                        value={company.mail_from_address}
                                        onChange={(e) => setCompany({ ...company, mail_from_address: e.target.value })}
                                        placeholder="billing@mikrotek.id"
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nama Pengirim (From Name)</label>
                                    <input
                                        type="text"
                                        value={company.mail_from_name}
                                        onChange={(e) => setCompany({ ...company, mail_from_name: e.target.value })}
                                        placeholder="Mikrotek Business Suite"
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                                <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold flex items-center space-x-1.5 shadow-md shadow-blue-500/20">
                                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    <span>Simpan Konfigurasi SMTP</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'registrar' && (
                        <RegistrarSettings company={company} setCompany={setCompany} onSave={handleSaveCompany} saving={saving} />
                    )}

                    {activeTab === 'webmail' && (
                        <form onSubmit={handleSaveCompany} className="space-y-6 text-xs bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <Server className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        <span>Pengaturan Webmail Client Self-Hosted</span>
                                    </h3>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                        Atur URL Webmail portal &amp; kredensial server email terhubung untuk pengguna sistem.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                        URL Server Webmail Client (Portal Webmail Path / Subdomain)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="/webmail/ atau https://webmail.perusahaan.com"
                                        value={company.webmail_url || '/webmail/'}
                                        onChange={(e) => setCompany({ ...company, webmail_url: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
                                    />
                                    <span className="text-[10px] text-slate-400 mt-1 block">
                                        Default: `/webmail/` (menunjuk ke paket Self-Hosted Roundcube lokal di folder `public/webmail`).
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                    <div className="md:col-span-2">
                                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                            Host Server Mail / IMAP (Terima Email)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="mail.perusahaan.com / imap.gmail.com"
                                            value={company.webmail_imap_host || ''}
                                            onChange={(e) => setCompany({ ...company, webmail_imap_host: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                            Port IMAP Server
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="993"
                                            value={company.webmail_imap_port || 993}
                                            onChange={(e) => setCompany({ ...company, webmail_imap_port: parseInt(e.target.value) || 993 })}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* SECTION: WEBMAIL SMTP SERVER (KHUSUS ROUNDCUBE) */}
                                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                        <Mail className="w-4 h-4 text-blue-500" />
                                        <span>SMTP Server Webmail Client (Kirim Email via Roundcube)</span>
                                    </h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Pengaturan server SMTP khusus yang digunakan Roundcube Webmail untuk mengirim surel bisnis pengguna.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                                Host SMTP Server Webmail (Contoh: mail.perusahaan.com)
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="mail.perusahaan.com / smtp.gmail.com"
                                                value={company.webmail_smtp_host || ''}
                                                onChange={(e) => setCompany({ ...company, webmail_smtp_host: e.target.value })}
                                                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                                Port SMTP Webmail
                                            </label>
                                            <input
                                                type="number"
                                                placeholder="587"
                                                value={company.webmail_smtp_port || 587}
                                                onChange={(e) => setCompany({ ...company, webmail_smtp_port: parseInt(e.target.value) || 587 })}
                                                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center space-x-1.5 shadow-md shadow-blue-500/20 transition"
                                >
                                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    <span>Simpan Pengaturan Webmail</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Tab 3A: Master Departemen */}
                    {activeTab === 'departments' && (
                        <div className="space-y-4 text-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-3">
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                        <span>Master Departemen (Department)</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Kelola divisi &amp; departemen kerja karyawan perusahaan.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleOpenDepModal()}
                                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center space-x-1.5 transition-all self-start sm:self-auto"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Tambah Departemen</span>
                                </button>
                            </div>

                            {departments.length === 0 ? (
                                <div className="p-8 text-center border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 bg-white dark:bg-[#0f172a]">
                                    Belum ada departemen terdaftar. Klik "Tambah Departemen" untuk membuat baru.
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                                <th className="py-3.5 px-4">Kode</th>
                                                <th className="py-3.5 px-4">Nama Departemen</th>
                                                <th className="py-3.5 px-4">Keterangan</th>
                                                <th className="py-3.5 px-4">Status Aktif</th>
                                                <th className="py-3.5 px-4 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                            {departments.map((d) => (
                                                <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="py-3.5 px-4 font-mono font-bold">
                                                        <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[11px]">
                                                            {d.code}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                                                        {d.name}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                                                        {d.description || '-'}
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleDepStatus(d)}
                                                            className="focus:outline-none"
                                                            title="Klik untuk mengubah status aktif"
                                                        >
                                                            {d.is_active ?? true ? (
                                                                <span className="px-2.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 flex items-center gap-1">
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                    <span>Aktif</span>
                                                                </span>
                                                            ) : (
                                                                <span className="px-2.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold border border-slate-200 dark:border-slate-700">
                                                                    Nonaktif
                                                                </span>
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right space-x-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenDepModal(d)}
                                                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                                                            title="Edit Departemen"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteDep(d.id)}
                                                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                                            title="Hapus Departemen"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 3B: Master Jabatan */}
                    {activeTab === 'positions' && (
                        <div className="space-y-4 text-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-3">
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        <span>Master Jabatan (Position)</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Kelola struktur jabatan, posisi pekerjaan, dan pengelompokkan departemennya.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleOpenPosModal()}
                                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all self-start sm:self-auto"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Tambah Jabatan</span>
                                </button>
                            </div>

                            {positions.length === 0 ? (
                                <div className="p-8 text-center border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 bg-white dark:bg-[#0f172a]">
                                    Belum ada jabatan terdaftar. Klik "Tambah Jabatan" untuk membuat baru.
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                                <th className="py-3.5 px-4">Kode</th>
                                                <th className="py-3.5 px-4">Nama Jabatan</th>
                                                <th className="py-3.5 px-4">Departemen</th>
                                                <th className="py-3.5 px-4">Keterangan</th>
                                                <th className="py-3.5 px-4">Status Aktif</th>
                                                <th className="py-3.5 px-4 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                            {positions.map((p) => (
                                                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="py-3.5 px-4 font-mono font-bold">
                                                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[11px]">
                                                            {p.code}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                                                        {p.name}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                                                        {p.department?.name || <span className="text-slate-400 italic">Tanpa Departemen</span>}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                                                        {p.description || '-'}
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleTogglePosStatus(p)}
                                                            className="focus:outline-none"
                                                            title="Klik untuk mengubah status aktif"
                                                        >
                                                            {p.is_active ?? true ? (
                                                                <span className="px-2.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 flex items-center gap-1">
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                    <span>Aktif</span>
                                                                </span>
                                                            ) : (
                                                                <span className="px-2.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold border border-slate-200 dark:border-slate-700">
                                                                    Nonaktif
                                                                </span>
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right space-x-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenPosModal(p)}
                                                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                                                            title="Edit Jabatan"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeletePos(p.id)}
                                                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                                            title="Hapus Jabatan"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 3C: Status Kerja */}
                    {activeTab === 'employment_statuses' && (
                        <div className="space-y-4 text-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-3">
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        <span>Master Status Kerja (Employment Status)</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Kelola jenis status hubungan kerja karyawan (Kontrak, Tetap, Probation, Magang, Freelance, dll).
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleOpenStatusModal()}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 transition-all self-start sm:self-auto"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Tambah Status Kerja</span>
                                </button>
                            </div>

                            {employmentStatuses.length === 0 ? (
                                <div className="p-8 text-center border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 bg-white dark:bg-[#0f172a]">
                                    Belum ada status kerja terdaftar. Klik "Tambah Status Kerja" untuk membuat baru.
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                                <th className="py-3.5 px-4">Kode</th>
                                                <th className="py-3.5 px-4">Nama Status Kerja</th>
                                                <th className="py-3.5 px-4">Keterangan</th>
                                                <th className="py-3.5 px-4">Status Aktif</th>
                                                <th className="py-3.5 px-4 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                            {employmentStatuses.map((st) => (
                                                <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="py-3.5 px-4 font-mono font-bold">
                                                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px]">
                                                            {st.code}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                                                        {st.name}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                                                        {st.description || '-'}
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleEmploymentStatus(st)}
                                                            className="focus:outline-none"
                                                            title="Klik untuk mengubah status aktif"
                                                        >
                                                            {st.is_active ?? true ? (
                                                                <span className="px-2.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 flex items-center gap-1">
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                    <span>Aktif</span>
                                                                </span>
                                                            ) : (
                                                                <span className="px-2.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold border border-slate-200 dark:border-slate-700">
                                                                    Nonaktif
                                                                </span>
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right space-x-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenStatusModal(st)}
                                                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                                                            title="Edit Status Kerja"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteStatus(st.id)}
                                                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                                            title="Hapus Status Kerja"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'taxes' && (
                        <div className="space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-3">
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <Percent className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        <span>Master Tarif Pajak (PPN / PPh)</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Kelola tarif pajak resmi perusahaan seperti PPN 11%, PPh 23, PPh 4(2), atau tarif Bebas Pajak.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleOpenTaxModal()}
                                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all self-start sm:self-auto"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Tambah Tarif Pajak</span>
                                </button>
                            </div>

                            {taxRates.length === 0 ? (
                                <div className="p-8 text-center border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 bg-white dark:bg-[#0f172a]">
                                    Belum ada tarif pajak terdaftar. Klik "Tambah Tarif Pajak" untuk membuat tarif baru.
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                                <th className="py-3.5 px-4">Kode Tarif</th>
                                                <th className="py-3.5 px-4">Nama Tarif Pajak</th>
                                                <th className="py-3.5 px-4">Persentase (%)</th>
                                                <th className="py-3.5 px-4">Status Aktif</th>
                                                <th className="py-3.5 px-4 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                            {taxRates.map((t) => (
                                                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="py-3.5 px-4 font-mono font-bold">
                                                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[11px]">
                                                            {t.code}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                                                        {t.name}
                                                    </td>
                                                    <td className="py-3.5 px-4 font-mono font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                                                        {t.percent}%
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleTaxStatus(t)}
                                                            className="focus:outline-none"
                                                            title="Klik untuk mengubah status aktif"
                                                        >
                                                            {t.is_active ?? true ? (
                                                                <span className="px-2.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 flex items-center gap-1">
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                    <span>Aktif</span>
                                                                </span>
                                                            ) : (
                                                                <span className="px-2.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold border border-slate-200 dark:border-slate-700">
                                                                    Nonaktif
                                                                </span>
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right space-x-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenTaxModal(t)}
                                                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                                                            title="Edit Tarif Pajak"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteTaxRate(t.id)}
                                                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                                            title="Hapus Tarif Pajak"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 5: Metode Pembayaran Kas & Transfer */}
                    {activeTab === 'payments' && (
                        <div className="space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-3">
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        <span>Metode Pembayaran Kas, Transfer, & E-Wallet</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Kelola pilihan metode transaksi penerimaan pembayaran & pelunasan kwitansi resmi.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleOpenPaymentMethodModal()}
                                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all self-start sm:self-auto"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Tambah Metode Pembayaran</span>
                                </button>
                            </div>

                            {paymentMethods.length === 0 ? (
                                <div className="p-8 text-center border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 bg-white dark:bg-[#0f172a]">
                                    Belum ada metode pembayaran terdaftar. Klik "Tambah Metode Pembayaran" untuk membuat metode baru.
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                                <th className="py-3.5 px-4">Kode Metode</th>
                                                <th className="py-3.5 px-4">Nama Metode Pembayaran</th>
                                                <th className="py-3.5 px-4">Keterangan / Deskripsi</th>
                                                <th className="py-3.5 px-4">Status Aktif</th>
                                                <th className="py-3.5 px-4 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                            {paymentMethods.map((m) => (
                                                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="py-3.5 px-4 font-mono font-bold">
                                                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[11px]">
                                                            {m.code}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                                                        {m.name}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs">
                                                        {m.description || '-'}
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleTogglePaymentMethodStatus(m)}
                                                            className="focus:outline-none"
                                                            title="Klik untuk mengubah status aktif"
                                                        >
                                                            {m.is_active ?? true ? (
                                                                <span className="px-2.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 flex items-center gap-1">
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                    <span>Aktif</span>
                                                                </span>
                                                            ) : (
                                                                <span className="px-2.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold border border-slate-200 dark:border-slate-700">
                                                                    Nonaktif
                                                                </span>
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right space-x-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenPaymentMethodModal(m)}
                                                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                                                            title="Edit Metode Pembayaran"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeletePaymentMethod(m.id)}
                                                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                                            title="Hapus Metode Pembayaran"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Tab: Template Dokumen PDF (Invoice, Quote, Kwitansi) ── */}
                    {activeTab === 'receipt_template' && (
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-3">
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Template Dokumen PDF Resmi</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Pilih template cetak default untuk Invoice Tagihan, Penawaran Harga (Quote), dan Kwitansi Pembayaran.
                                    </p>
                                </div>
                                <button
                                    onClick={handleSaveCompany}
                                    disabled={saving}
                                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors disabled:opacity-60 self-start md:self-auto"
                                >
                                    {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                    <span>Simpan Pilihan Template</span>
                                </button>
                            </div>

                            {/* Document Type Category Switcher */}
                            <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                                <button
                                    type="button"
                                    onClick={() => setDocCategory('quote')}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                                        docCategory === 'quote'
                                            ? 'bg-purple-600 text-white shadow-sm'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Penawaran Harga (Quote)</span>
                                    <span className="text-[10px] opacity-80 font-mono">({company.quote_template || 'modern'})</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setDocCategory('invoice')}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                                        docCategory === 'invoice'
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Invoice Tagihan</span>
                                    <span className="text-[10px] opacity-80 font-mono">({company.invoice_template || 'modern'})</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setDocCategory('receipt')}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                                        docCategory === 'receipt'
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    <span>Kwitansi Pembayaran</span>
                                    <span className="text-[10px] opacity-80 font-mono">({company.receipt_template || 'modern'})</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setDocCategory('contract')}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                                        docCategory === 'contract'
                                            ? 'bg-slate-700 text-white shadow-sm'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Surat Kontrak Kerja</span>
                                    <span className="text-[10px] opacity-80 font-mono">({company.contract_template || 'formal'})</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setDocCategory('payslip')}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                                        docCategory === 'payslip'
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <Banknote className="w-3.5 h-3.5" />
                                    <span>Slip Gaji Karyawan</span>
                                    <span className="text-[10px] opacity-80 font-mono">({company.payslip_template || 'modern'})</span>
                                </button>
                            </div>

                            {/* Template Cards Grid for Active Category */}
                            {docCategory === 'invoice' && (
                                <div className="space-y-3">
                                    <div className="text-xs text-slate-500 font-semibold">Pilih Desain Default Invoice Tagihan:</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {invoiceTemplates.map((tmpl) => {
                                            const isActive = company.invoice_template === tmpl.key;
                                            return (
                                                <button
                                                    key={tmpl.key}
                                                    type="button"
                                                    onClick={() => setCompany(c => ({ ...c, invoice_template: tmpl.key }))}
                                                    className={`text-left rounded-xl border-2 p-4 transition-all ${
                                                        isActive
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md shadow-blue-500/10'
                                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900/40'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-2xl">{tmpl.preview_icon}</span>
                                                            <div>
                                                                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                                                    {tmpl.name}
                                                                </div>
                                                                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                                                    {tmpl.paper} {tmpl.orientation} · by {tmpl.author}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {isActive && (
                                                            <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                                                                <CheckCircle2 className="w-3 h-3" /> DEFAULT
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                                                        {tmpl.description}
                                                    </p>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-3 h-3 rounded-full border border-white/30 shadow-sm"
                                                                style={{ backgroundColor: tmpl.accent_color }}
                                                            />
                                                            <span className="text-[10px] text-slate-400 font-mono">v{tmpl.version}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openPdfPreview(`/invoices/1/pdf?template=${tmpl.key}`);
                                                            }}
                                                            className="text-[10px] text-blue-500 hover:underline cursor-pointer"
                                                        >
                                                            Preview PDF →
                                                        </button>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {docCategory === 'quote' && (
                                <div className="space-y-3">
                                    <div className="text-xs text-slate-500 font-semibold">Pilih Desain Default Penawaran Harga (Quote):</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {quoteTemplates.map((tmpl) => {
                                            const isActive = company.quote_template === tmpl.key;
                                            return (
                                                <button
                                                    key={tmpl.key}
                                                    type="button"
                                                    onClick={() => setCompany(c => ({ ...c, quote_template: tmpl.key }))}
                                                    className={`text-left rounded-xl border-2 p-4 transition-all ${
                                                        isActive
                                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md shadow-purple-500/10'
                                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900/40'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-2xl">{tmpl.preview_icon}</span>
                                                            <div>
                                                                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                                                    {tmpl.name}
                                                                </div>
                                                                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                                                    {tmpl.paper} {tmpl.orientation} · by {tmpl.author}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {isActive && (
                                                            <span className="flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded-full">
                                                                <CheckCircle2 className="w-3 h-3" /> DEFAULT
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                                                        {tmpl.description}
                                                    </p>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-3 h-3 rounded-full border border-white/30 shadow-sm"
                                                                style={{ backgroundColor: tmpl.accent_color }}
                                                            />
                                                            <span className="text-[10px] text-slate-400 font-mono">v{tmpl.version}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openPdfPreview(`/quotes/1/pdf?template=${tmpl.key}`);
                                                            }}
                                                            className="text-[10px] text-purple-500 hover:underline cursor-pointer"
                                                        >
                                                            Preview PDF →
                                                        </button>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {docCategory === 'receipt' && (
                                <div className="space-y-3">
                                    <div className="text-xs text-slate-500 font-semibold">Pilih Desain Default Kwitansi Pembayaran:</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {receiptTemplates.map((tmpl) => {
                                            const isActive = company.receipt_template === tmpl.key;
                                            return (
                                                <button
                                                    key={tmpl.key}
                                                    type="button"
                                                    onClick={() => setCompany(c => ({ ...c, receipt_template: tmpl.key }))}
                                                    className={`text-left rounded-xl border-2 p-4 transition-all ${
                                                        isActive
                                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-md shadow-emerald-500/10'
                                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900/40'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-2xl">{tmpl.preview_icon}</span>
                                                            <div>
                                                                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                                                    {tmpl.name}
                                                                </div>
                                                                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                                                    {tmpl.paper} {tmpl.orientation} · by {tmpl.author}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {isActive && (
                                                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
                                                                <CheckCircle2 className="w-3 h-3" /> DEFAULT
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                                                        {tmpl.description}
                                                    </p>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-3 h-3 rounded-full border border-white/30 shadow-sm"
                                                                style={{ backgroundColor: tmpl.accent_color }}
                                                            />
                                                            <span className="text-[10px] text-slate-400 font-mono">v{tmpl.version}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openPdfPreview(`/payments/1/receipt?template=${tmpl.key}`);
                                                            }}
                                                            className="text-[10px] text-emerald-500 hover:underline cursor-pointer"
                                                        >
                                                            Preview PDF →
                                                        </button>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {docCategory === 'contract' && (
                                <div className="space-y-3">
                                    <div className="text-xs text-slate-500 font-semibold">Pilih Desain Default Surat Kontrak Kerja:</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {contractTemplates.map((tmpl) => {
                                            const isActive = company.contract_template === tmpl.key;
                                            return (
                                                <button
                                                    key={tmpl.key}
                                                    type="button"
                                                    onClick={() => setCompany(c => ({ ...c, contract_template: tmpl.key }))}
                                                    className={`text-left rounded-xl border-2 p-4 transition-all ${
                                                        isActive
                                                            ? 'border-slate-700 bg-slate-50 dark:bg-slate-900/60 shadow-md shadow-slate-500/10'
                                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900/40'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-2xl">{tmpl.preview_icon}</span>
                                                            <div>
                                                                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                                                    {tmpl.name}
                                                                </div>
                                                                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                                                    {tmpl.paper} {tmpl.orientation} · by {tmpl.author}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {isActive && (
                                                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                                                                <CheckCircle2 className="w-3 h-3" /> DEFAULT
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                                                        {tmpl.description}
                                                    </p>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-3 h-3 rounded-full border border-white/30 shadow-sm"
                                                                style={{ backgroundColor: tmpl.accent_color }}
                                                            />
                                                            <span className="text-[10px] text-slate-400 font-mono">v{tmpl.version}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openPdfPreview(`/hr/employees/1/contract?template=${tmpl.key}`);
                                                            }}
                                                            className="text-[10px] text-slate-500 hover:underline cursor-pointer"
                                                        >
                                                            Preview PDF →
                                                        </button>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {docCategory === 'payslip' && (
                                <div className="space-y-3">
                                    <div className="text-xs text-slate-500 font-semibold">Pilih Desain Default Slip Gaji Karyawan (Payslip):</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {payslipTemplates.map((tmpl) => {
                                            const isActive = company.payslip_template === tmpl.key;
                                            return (
                                                <button
                                                    key={tmpl.key}
                                                    type="button"
                                                    onClick={() => setCompany(c => ({ ...c, payslip_template: tmpl.key }))}
                                                    className={`text-left rounded-xl border-2 p-4 transition-all ${
                                                        isActive
                                                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 shadow-md shadow-indigo-500/10'
                                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900/40'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-2xl">{tmpl.preview_icon}</span>
                                                            <div>
                                                                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                                                    {tmpl.name}
                                                                </div>
                                                                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                                                    {tmpl.paper} {tmpl.orientation} · by {tmpl.author}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {isActive && (
                                                            <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full">
                                                                <CheckCircle2 className="w-3 h-3" /> DEFAULT
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                                                        {tmpl.description}
                                                    </p>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-3 h-3 rounded-full border border-white/30 shadow-sm"
                                                                style={{ backgroundColor: tmpl.accent_color }}
                                                            />
                                                            <span className="text-[10px] text-slate-400 font-mono">v{tmpl.version}</span>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Developer Hint */}
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                                <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <Code className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span>Arsitektur Multi-Template Dokumen (Developer Guide)</span>
                                </div>
                                <ol className="list-decimal list-inside space-y-0.5 ml-1">
                                    <li><strong>Invoice:</strong> <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded">resources/views/pdf/invoice_&lt;key&gt;.blade.php</code> (terdaftar di <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded">InvoiceTemplateRegistry.php</code>)</li>
                                    <li><strong>Quote:</strong> <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded">resources/views/pdf/quote_&lt;key&gt;.blade.php</code> (terdaftar di <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded">QuoteTemplateRegistry.php</code>)</li>
                                    <li><strong>Kwitansi:</strong> <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded">resources/views/pdf/receipt_&lt;key&gt;.blade.php</code> (terdaftar di <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded">ReceiptTemplateRegistry.php</code>)</li>
                                    <li><strong>Kontrak Kerja:</strong> <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded">resources/views/pdf/contract_&lt;key&gt;.blade.php</code> (terdaftar di <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded">ContractTemplateRegistry.php</code>)</li>
                                    <li><strong>Slip Gaji:</strong> <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded">resources/views/pdf/payslip_&lt;key&gt;.blade.php</code> (terdaftar di <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded">PayslipTemplateRegistry.php</code>)</li>
                                </ol>
                            </div>
                        </div>
                    )}

                    {/* TAB: BACKUP & SAFE STORAGE */}
                    {activeTab === 'backup' && (
                        <BackupSettingsTab />
                    )}

                    {/* TAB 12: TENTANG APLIKASI (ABOUT & CHANGELOG) */}
                    {activeTab === 'about' && (
                        <div className="space-y-6">
                            {/* App Header Banner */}
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 md:p-8 text-white shadow-xl">
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 rounded-2xl bg-blue-600/30 backdrop-blur-md border border-blue-400/30 flex items-center justify-center text-3xl font-black shadow-inner">
                                            M
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-2xl font-black tracking-tight text-white">Mikrotek Business Suite (MBS)</h2>
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-sm">
                                                    Neo Enterprise
                                                </span>
                                            </div>
                                            <p className="text-xs text-blue-200 mt-1 max-w-xl">
                                                Sistem Manajemen Operasional Terpadu, ERP, Keuangan, Perpajakan (e-Faktur), dan Sumber Daya Manusia (HR) PT Mikrotek Zemiro Indonesia.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-start md:items-end space-y-2">
                                        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            <span className="text-xs font-bold text-slate-100">Versi Terpasang: v2.5.4 (Build 2026.08.23)</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleCheckUpdate}
                                            disabled={checkingUpdate}
                                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center space-x-2 transition-all cursor-pointer"
                                        >
                                            {checkingUpdate ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                                            <span>Cek Pembaruan Sistem</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                            </div>

                            {/* System Health & Environment Info Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Status Lisensi</span>
                                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        ENTERPRISE LIFETIME
                                    </span>
                                </div>
                                <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Framework Backend</span>
                                    <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 font-mono">Laravel v11.45.0</span>
                                </div>
                                <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Frontend Engine</span>
                                    <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 font-mono">React 18 + Vite 6</span>
                                </div>
                                <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Database Server</span>
                                    <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 font-mono">MySQL 8.0</span>
                                </div>
                            </div>

                            {/* Change Log Timeline */}
                            <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            <span>Catatan Perubahan &amp; Pembaruan (Changelog)</span>
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Riwayat pembaruan fitur, perbaikan bug, dan optimasi performa aplikasi.
                                        </p>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[11px] font-bold">
                                        Latest Stable Build
                                    </span>
                                </div>

                                {/* Version Timeline Items */}
                                <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 pl-8">
                                    {/* Release v2.5.4 */}
                                    <div className="relative">
                                        <div className="absolute -left-8 top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white dark:border-[#0f172a] shadow-sm"></div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">v2.5.4</span>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Versi Saat Ini</span>
                                                <span className="text-xs text-slate-400">• 23 Agustus 2026</span>
                                            </div>
                                            <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
                                                <li><strong className="text-slate-900 dark:text-slate-100">Modul Faktur Pajak (e-Faktur)</strong>: Fitur baru CRUD Faktur Pajak, upload dokumen e-Faktur (PDF/Image), dan penghubungan otomatis dengan Invoice &amp; Tagihan.</li>
                                                <li><strong className="text-slate-900 dark:text-slate-100">Halaman Formulir Standalone Faktur Pajak</strong>: Pengubahan dari modal popup menjadi halaman formulir mandiri dengan fitur kalkulasi PPN (11%, 12%, 0%).</li>
                                                <li><strong className="text-slate-900 dark:text-slate-100">Navigasi Pengaturan Sistem Vertikal</strong>: Pembaruan tampilan menu Pengaturan Sistem menjadi vertical tab ber-kategori rapi.</li>
                                                <li><strong className="text-slate-900 dark:text-slate-100">Rekap Absensi Bulanan &amp; Penyesuaian HR</strong>: Penambahan fitur edit total akumulasi absensi bulanan karyawan langsung dari tabel rekap presensi.</li>
                                                <li><strong className="text-slate-900 dark:text-slate-100">Tentang Aplikasi &amp; Cek Pembaruan</strong>: Tab baru pada Pengaturan Sistem untuk cek update, lisensi, dan changelog rilis.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Release v2.4.0 */}
                                    <div className="relative">
                                        <div className="absolute -left-8 top-0.5 w-4 h-4 rounded-full bg-slate-400 border-2 border-white dark:border-[#0f172a]"></div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">v2.4.0</span>
                                                <span className="text-xs text-slate-400">• 15 Agustus 2026</span>
                                            </div>
                                            <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
                                                <li><strong className="text-slate-900 dark:text-slate-100">Master Data HR Terpisah</strong>: Pemisahan menu Master Departemen, Master Jabatan, dan Status Kerja.</li>
                                                <li><strong className="text-slate-900 dark:text-slate-100">Modul Produk &amp; Jasa</strong>: Pengelompokan grup navigasi baru PRODUK &amp; JASA (Katalog, Kategori, Satuan Unit).</li>
                                                <li><strong className="text-slate-900 dark:text-slate-100">Pemisahan Administrator &amp; Karyawan</strong>: Pembaruan arsitektur seeder agar akun Administrator Sistem terpisah dari profil Karyawan.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Release v2.0.0 */}
                                    <div className="relative">
                                        <div className="absolute -left-8 top-0.5 w-4 h-4 rounded-full bg-slate-300 border-2 border-white dark:border-[#0f172a]"></div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">v2.0.0</span>
                                                <span className="text-xs text-slate-400">• 1 Agustus 2026</span>
                                            </div>
                                            <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
                                                <li>Peluncuran Perdana Mikrotek Business Suite Neo Arsitektur Modular.</li>
                                                <li>Fitur Manajemen Klien, Invoice &amp; Kwitansi, Presensi HR, dan Peranan (RBAC).</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Support Card */}
                            <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                                        <HelpCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-slate-100">Butuh Bantuan Bantuan atau Penambahan Fitur Custom?</h4>
                                        <p className="text-slate-500 dark:text-slate-400">Tim Dukungan Teknis PT Mikrotek Zemiro Indonesia siap membantu 24/7.</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <a
                                        href="mailto:support@mzi.co.id"
                                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold transition-all"
                                    >
                                        Hubungi Support
                                    </a>
                                    <a
                                        href="https://mikrotek.co.id"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all"
                                    >
                                        Kunjungi Website
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: KATEGORI REIMBURSEMENT */}
                    {activeTab === 'reimbursement_categories' && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        <span>Master Data Kategori Reimbursement</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Kelola kategori klaim biaya operasional karyawan &amp; batas nominal maksimal (limit).
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleOpenReimbCatModal()}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 transition-all self-start sm:self-auto cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>+ Tambah Kategori Baru</span>
                                </button>
                            </div>

                            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm text-xs">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                                <th className="py-3 px-4">Icon &amp; Nama Kategori</th>
                                                <th className="py-3 px-4">Kode Unik</th>
                                                <th className="py-3 px-4">Deskripsi / Keterangan</th>
                                                <th className="py-3 px-4 text-right">Limit Maksimal (Rp)</th>
                                                <th className="py-3 px-4 text-center">Status</th>
                                                <th className="py-3 px-4 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                            {reimbursementCategories.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="py-8 text-center text-slate-500">
                                                        Belum ada master kategori reimbursement. Klik "+ Tambah Kategori Baru".
                                                    </td>
                                                </tr>
                                            ) : (
                                                reimbursementCategories.map((cat) => (
                                                    <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-base">{cat.icon || '📝'}</span>
                                                                <span>{cat.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                            {cat.code}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs">
                                                            {cat.description || '-'}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                                                            {cat.max_limit && cat.max_limit > 0 ? (
                                                                new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(cat.max_limit)
                                                            ) : (
                                                                <span className="text-slate-400 font-normal italic">Tanpa Batas (Unlimited)</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleReimbCatStatus(cat)}
                                                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer transition-all ${
                                                                    cat.is_active
                                                                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20'
                                                                        : 'bg-slate-500/10 text-slate-500 border border-slate-500/20 hover:bg-slate-500/20'
                                                                }`}
                                                            >
                                                                {cat.is_active ? 'AKTIF' : 'NON-AKTIF'}
                                                            </button>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-right space-x-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenReimbCatModal(cat)}
                                                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                                title="Edit Data Kategori"
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteReimbCat(cat.id)}
                                                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                                title="Hapus Kategori"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'hosting_types' && (
                        <HostingTypeSettings />
                    )}

                    {activeTab === 'document_types' && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                            <FolderKanban className="w-4 h-4 text-blue-500" />
                                            <span>Master Data Jenis Dokumen Project</span>
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Kelola jenis dokumen (MOU, SPK, BAST, Desain, Technical, dll.) untuk klasifikasi pengarsipan proyek.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleOpenDocTypeModal(null)}
                                        className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Tambah Jenis Dokumen</span>
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                                                <th className="py-3 px-4">Nama Jenis Dokumen</th>
                                                <th className="py-3 px-4">Kode</th>
                                                <th className="py-3 px-4">Deskripsi / Keterangan</th>
                                                <th className="py-3 px-4 text-center">Status</th>
                                                <th className="py-3 px-4 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                                            {documentTypes.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="p-8 text-center text-slate-400 italic">
                                                        Belum ada jenis dokumen terdaftar.
                                                    </td>
                                                </tr>
                                            ) : (
                                                documentTypes.map((dt) => (
                                                    <tr key={dt.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                                                            {dt.name}
                                                        </td>
                                                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                                                            {dt.code}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs">
                                                            {dt.description || '-'}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleDocTypeStatus(dt)}
                                                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer transition-all ${
                                                                    dt.is_active
                                                                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20'
                                                                        : 'bg-slate-500/10 text-slate-500 border border-slate-500/20 hover:bg-slate-500/20'
                                                                }`}
                                                            >
                                                                {dt.is_active ? 'AKTIF' : 'NON-AKTIF'}
                                                            </button>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-right space-x-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenDocTypeModal(dt)}
                                                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                                title="Edit Jenis Dokumen"
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteDocType(dt.id)}
                                                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                                title="Hapus Jenis Dokumen"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Modal Add/Edit Document Type */}
                            {showDocTypeModal && (
                                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4">
                                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                                <FolderKanban className="w-4 h-4 text-blue-500" />
                                                <span>{editingDocType ? 'Edit Jenis Dokumen' : 'Tambah Jenis Dokumen'}</span>
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={() => setShowDocTypeModal(false)}
                                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <form onSubmit={handleSubmitDocType} className="p-6 space-y-4 text-xs">
                                            <div>
                                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                                    Nama Jenis Dokumen *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={docTypeForm.name}
                                                    onChange={(e) => setDocTypeForm({ ...docTypeForm, name: e.target.value })}
                                                    placeholder="Contoh: Berita Acara Serah Terima (BAST)"
                                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-medium"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                                    Kode Singkatan *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={docTypeForm.code}
                                                    onChange={(e) => setDocTypeForm({ ...docTypeForm, code: e.target.value.toUpperCase() })}
                                                    placeholder="Contoh: BAST"
                                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-mono font-bold"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                                    Deskripsi / Keterangan
                                                </label>
                                                <textarea
                                                    rows="3"
                                                    value={docTypeForm.description}
                                                    onChange={(e) => setDocTypeForm({ ...docTypeForm, description: e.target.value })}
                                                    placeholder="Keterangan singkat mengenai jenis dokumen ini..."
                                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-medium"
                                                />
                                            </div>

                                            <div className="flex items-center space-x-2 pt-1">
                                                <input
                                                    type="checkbox"
                                                    id="is_active_doctype"
                                                    checked={docTypeForm.is_active}
                                                    onChange={(e) => setDocTypeForm({ ...docTypeForm, is_active: e.target.checked })}
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <label htmlFor="is_active_doctype" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                                                    Status Aktif (Dapat dipilih pada pengunggahan dokumen project)
                                                </label>
                                            </div>

                                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDocTypeModal(false)}
                                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all"
                                                >
                                                    Batal
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={submittingDocType}
                                                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all flex items-center gap-2"
                                                >
                                                    {submittingDocType && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                                                    <span>{editingDocType ? 'Perbarui' : 'Simpan'}</span>
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Add/Edit Bank Account */}
            {showBankModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                {editingBank ? 'Edit Rekening Bank Perusahaan' : 'Tambah Rekening Bank Baru'}
                            </h3>
                            <button onClick={() => setShowBankModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveBank} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nama Bank *</label>
                                <SearchableSelect
                                    options={[
                                        { value: 'Bank BCA', label: 'Bank BCA' },
                                        { value: 'Bank Mandiri', label: 'Bank Mandiri' },
                                        { value: 'Bank BNI', label: 'Bank BNI' },
                                        { value: 'Bank BRI', label: 'Bank BRI' },
                                        { value: 'Bank CIMB Niaga', label: 'Bank CIMB Niaga' },
                                        { value: 'Bank Permata', label: 'Bank Permata' },
                                        { value: 'Bank Syariah Indonesia (BSI)', label: 'Bank Syariah Indonesia (BSI)' },
                                        { value: 'Lainnya', label: 'Lainnya' },
                                    ]}
                                    value={bankForm.bank_name}
                                    onChange={(val) => setBankForm({ ...bankForm, bank_name: val })}
                                    placeholder="Pilih Bank..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nomor Rekening *</label>
                                    <input
                                        type="text"
                                        required
                                        value={bankForm.account_number}
                                        onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value })}
                                        placeholder="ex: 8830192831"
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nama Pemilik Rekening (a/n) *</label>
                                    <input
                                        type="text"
                                        required
                                        value={bankForm.account_holder}
                                        onChange={(e) => setBankForm({ ...bankForm, account_holder: e.target.value })}
                                        placeholder="ex: PT Mikrotek Zemiro Indonesia"
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Cabang Kantor Bank</label>
                                    <input
                                        type="text"
                                        value={bankForm.branch}
                                        onChange={(e) => setBankForm({ ...bankForm, branch: e.target.value })}
                                        placeholder="ex: KCP Sudirman Jakarta"
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                    />
                                </div>
                                <div className="flex items-center pt-5">
                                    <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={bankForm.is_primary}
                                            onChange={(e) => setBankForm({ ...bankForm, is_primary: e.target.checked })}
                                            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span>Jadikan Rekening Utama</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowBankModal(false)}
                                    className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingBank}
                                    className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-bold flex items-center space-x-1"
                                >
                                    {submittingBank ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Simpan Rekening</span>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Test SMTP Email Connection */}
            {showSmtpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Send className="w-4 h-4 text-emerald-500" />
                                <span>Tes Koneksi SMTP Server Email</span>
                            </h3>
                            <button onClick={() => setShowSmtpModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleTestSmtpSubmit} className="space-y-3.5 text-xs">
                            <p className="text-slate-500 dark:text-slate-400 text-xs">
                                Masukkan alamat email tujuan untuk menerima pesan sampel pengujian dari server SMTP ({company.mail_host || 'SMTP Server'}).
                            </p>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Email Penerima Uji Coba *</label>
                                <input
                                    type="email"
                                    required
                                    value={recipientEmail}
                                    onChange={(e) => setRecipientEmail(e.target.value)}
                                    placeholder="alamat.email.anda@gmail.com"
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                                />
                            </div>

                            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowSmtpModal(false)}
                                    className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={testingSmtp}
                                    className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-bold flex items-center space-x-1.5 shadow-sm"
                                >
                                    {testingSmtp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    <span>Kirim Email Sampel</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Add/Edit Tax Rate */}
            {showTaxModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Percent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <span>{editingTax ? 'Edit Master Tarif Pajak' : 'Tambah Master Tarif Pajak Baru'}</span>
                            </h3>
                            <button onClick={() => setShowTaxModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitTaxRate} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nama Tarif Pajak *</label>
                                <input
                                    type="text"
                                    required
                                    value={taxForm.name}
                                    onChange={(e) => setTaxForm({ ...taxForm, name: e.target.value })}
                                    placeholder="ex: PPN 11% / PPh Pasal 23"
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Kode Tarif Pajak *</label>
                                    <input
                                        type="text"
                                        required
                                        value={taxForm.code}
                                        onChange={(e) => setTaxForm({ ...taxForm, code: e.target.value.toUpperCase() })}
                                        placeholder="ex: PPN-11 / PPH-23"
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono font-bold uppercase focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Persentase (%) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        required
                                        value={taxForm.percent}
                                        onChange={(e) => setTaxForm({ ...taxForm, percent: parseFloat(e.target.value) || 0 })}
                                        placeholder="11.00"
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center pt-2">
                                <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={taxForm.is_active}
                                        onChange={(e) => setTaxForm({ ...taxForm, is_active: e.target.checked })}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>Status Tarif Pajak Aktif</span>
                                </label>
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowTaxModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingTax}
                                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
                                >
                                    {submittingTax ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    <span>{editingTax ? 'Simpan Perubahan' : 'Tambah Tarif Pajak'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Add/Edit Payment Method */}
            {showPaymentMethodModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <span>{editingPaymentMethod ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran Baru'}</span>
                            </h3>
                            <button onClick={() => setShowPaymentMethodModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitPaymentMethod} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nama Metode Pembayaran *</label>
                                <input
                                    type="text"
                                    required
                                    value={paymentMethodForm.name}
                                    onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, name: e.target.value })}
                                    placeholder="ex: Transfer Bank BCA / Cash Tunai / QRIS"
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Kode Metode Pembayaran *</label>
                                <input
                                    type="text"
                                    required
                                    value={paymentMethodForm.code}
                                    onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                                    placeholder="ex: BANK_TRANSFER / CASH / QRIS / GIRO"
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono font-bold uppercase focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Deskripsi / Keterangan Tambahan</label>
                                <input
                                    type="text"
                                    value={paymentMethodForm.description}
                                    onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, description: e.target.value })}
                                    placeholder="ex: Pembayaran transfer langsung ke rekening resmi perusahaan"
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="flex items-center pt-2">
                                <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={paymentMethodForm.is_active}
                                        onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, is_active: e.target.checked })}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>Status Metode Pembayaran Aktif</span>
                                </label>
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentMethodModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingPaymentMethod}
                                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
                                >
                                    {submittingPaymentMethod ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    <span>{editingPaymentMethod ? 'Simpan Perubahan' : 'Tambah Metode Pembayaran'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal Add/Edit Department */}
            {showDepModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                <span>{editingDep ? 'Edit Data Departemen' : 'Tambah Departemen Baru'}</span>
                            </h3>
                            <button onClick={() => setShowDepModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitDep} className="space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nama Departemen *</label>
                                <input
                                    type="text"
                                    required
                                    value={depForm.name}
                                    onChange={(e) => setDepForm({ ...depForm, name: e.target.value })}
                                    placeholder="ex: Technology & Engineering"
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-semibold focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Kode Departemen (Opsional)</label>
                                <input
                                    type="text"
                                    value={depForm.code}
                                    onChange={(e) => setDepForm({ ...depForm, code: e.target.value.toUpperCase() })}
                                    placeholder="ex: DEP-001 (Kosongkan untuk auto-generate)"
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono font-bold uppercase focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Keterangan / Deskripsi (Opsional)</label>
                                <textarea
                                    rows="2"
                                    value={depForm.description}
                                    onChange={(e) => setDepForm({ ...depForm, description: e.target.value })}
                                    placeholder="Keterangan singkat fungsi departemen..."
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div className="flex items-center pt-1">
                                <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={depForm.is_active}
                                        onChange={(e) => setDepForm({ ...depForm, is_active: e.target.checked })}
                                        className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span>Status Departemen Aktif</span>
                                </label>
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowDepModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingDep}
                                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center space-x-1.5 transition-all"
                                >
                                    {submittingDep ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    <span>{editingDep ? 'Simpan Perubahan' : 'Tambah Departemen'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Add/Edit Position */}
            {showPosModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span>{editingPos ? 'Edit Data Jabatan' : 'Tambah Jabatan Baru'}</span>
                            </h3>
                            <button onClick={() => setShowPosModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitPos} className="space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nama Jabatan *</label>
                                <input
                                    type="text"
                                    required
                                    value={posForm.name}
                                    onChange={(e) => setPosForm({ ...posForm, name: e.target.value })}
                                    placeholder="ex: Senior Fullstack Developer"
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-semibold focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Departemen Naungan</label>
                                <SearchableSelect
                                    options={[
                                        { value: '', label: '-- Tanpa Departemen / Umum --' },
                                        ...departments.map((d) => ({ value: d.id, label: d.name }))
                                    ]}
                                    value={posForm.department_id}
                                    onChange={(val) => setPosForm({ ...posForm, department_id: val })}
                                    placeholder="Pilih Departemen..."
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Kode Jabatan (Opsional)</label>
                                <input
                                    type="text"
                                    value={posForm.code}
                                    onChange={(e) => setPosForm({ ...posForm, code: e.target.value.toUpperCase() })}
                                    placeholder="ex: POS-001 (Kosongkan untuk auto-generate)"
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono font-bold uppercase focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Keterangan / Deskripsi (Opsional)</label>
                                <textarea
                                    rows="2"
                                    value={posForm.description}
                                    onChange={(e) => setPosForm({ ...posForm, description: e.target.value })}
                                    placeholder="Keterangan singkat peran jabatan..."
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="flex items-center pt-1">
                                <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={posForm.is_active}
                                        onChange={(e) => setPosForm({ ...posForm, is_active: e.target.checked })}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>Status Jabatan Aktif</span>
                                </label>
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPosModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingPos}
                                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
                                >
                                    {submittingPos ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    <span>{editingPos ? 'Simpan Perubahan' : 'Tambah Jabatan'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal Add/Edit Employment Status */}
            {showStatusModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>{editingStatus ? 'Edit Status Kerja' : 'Tambah Status Kerja Baru'}</span>
                            </h3>
                            <button onClick={() => setShowStatusModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitStatus} className="space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nama Status Kerja *</label>
                                <input
                                    type="text"
                                    required
                                    value={statusForm.name}
                                    onChange={(e) => setStatusForm({ ...statusForm, name: e.target.value })}
                                    placeholder="ex: Karyawan Tetap / Kontrak / Probation"
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-semibold focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Kode Status Kerja *</label>
                                <input
                                    type="text"
                                    required
                                    value={statusForm.code}
                                    onChange={(e) => setStatusForm({ ...statusForm, code: e.target.value.toUpperCase() })}
                                    placeholder="ex: PERMANENT / CONTRACT / PROBATION"
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono font-bold uppercase focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Keterangan / Deskripsi (Opsional)</label>
                                <textarea
                                    rows="2"
                                    value={statusForm.description}
                                    onChange={(e) => setStatusForm({ ...statusForm, description: e.target.value })}
                                    placeholder="Keterangan singkat ketentuan status kerja..."
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="flex items-center pt-1">
                                <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={statusForm.is_active}
                                        onChange={(e) => setStatusForm({ ...statusForm, is_active: e.target.checked })}
                                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span>Status Aktif</span>
                                </label>
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowStatusModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingStatus}
                                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 transition-all"
                                >
                                    {submittingStatus ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    <span>{editingStatus ? 'Simpan Perubahan' : 'Tambah Status Kerja'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal Add/Edit Reimbursement Category */}
            {showReimbCatModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>{editingReimbCat ? 'Edit Kategori Reimbursement' : 'Tambah Kategori Reimbursement Baru'}</span>
                            </h3>
                            <button onClick={() => setShowReimbCatModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitReimbCat} className="space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nama Kategori Reimbursement *</label>
                                <input
                                    type="text"
                                    required
                                    value={reimbCatForm.name}
                                    onChange={(e) => setReimbCatForm({ ...reimbCatForm, name: e.target.value })}
                                    placeholder="ex: Bensin & Transportasi / Kesehatan & Medis"
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-semibold focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Kode Kategori (Opsional)</label>
                                    <input
                                        type="text"
                                        value={reimbCatForm.code}
                                        onChange={(e) => setReimbCatForm({ ...reimbCatForm, code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                                        placeholder="ex: TRANSPORTATION"
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono font-bold uppercase focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Icon Emoji</label>
                                    <input
                                        type="text"
                                        value={reimbCatForm.icon}
                                        onChange={(e) => setReimbCatForm({ ...reimbCatForm, icon: e.target.value })}
                                        placeholder="ex: 🚗 / 🍱 / 💊 / 🛠️"
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 text-center font-bold focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Batas Maksimal Klaim / Limit (Rp) (Opsional, 0 = Tanpa Limit)</label>
                                <input
                                    type="number"
                                    step="1"
                                    min="0"
                                    value={reimbCatForm.max_limit}
                                    onChange={(e) => setReimbCatForm({ ...reimbCatForm, max_limit: parseFloat(e.target.value) || 0 })}
                                    placeholder="0"
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono font-bold focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Keterangan / Deskripsi (Opsional)</label>
                                <textarea
                                    rows="2"
                                    value={reimbCatForm.description}
                                    onChange={(e) => setReimbCatForm({ ...reimbCatForm, description: e.target.value })}
                                    placeholder="Keterangan singkat ketentuan klaim kategori ini..."
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="flex items-center pt-1">
                                <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={reimbCatForm.is_active}
                                        onChange={(e) => setReimbCatForm({ ...reimbCatForm, is_active: e.target.checked })}
                                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span>Status Kategori Aktif</span>
                                </label>
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowReimbCatModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingReimbCat}
                                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 transition-all"
                                >
                                    {submittingReimbCat ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    <span>{editingReimbCat ? 'Simpan Perubahan' : 'Tambah Kategori'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
