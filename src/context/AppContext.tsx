import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Customer,
  Metro,
  PublicIp,
  PricingConfig,
  BandwidthTier,
  ServiceItem,
  Quotation,
  Invoice,
  PaymentRecord,
  SystemUser,
  AuditLog,
  ActiveMenu,
  ToastMessage,
  UserRole,
  QuotationStatus,
  InvoicePaymentStatus,
  FeeWithdrawalRecord,
} from '../types';
import {
  INITIAL_CUSTOMERS,
  INITIAL_METRO,
  INITIAL_PUBLIC_IPS,
  INITIAL_PRICING,
  INITIAL_SERVICES,
  INITIAL_QUOTATIONS,
  INITIAL_INVOICES,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_WITHDRAWAL_RECORDS,
} from '../data/initialData';

const STORAGE_KEY = 'anten_biz_mgr_state_v1';

interface AppContextType {
  // Navigation
  activeMenu: ActiveMenu;
  setActiveMenu: (menu: ActiveMenu) => void;
  selectedCustomerIdForDetail: string | null;
  openCustomerDetail: (customerId: string) => void;
  closeCustomerDetail: () => void;

  // Active User / Role & Auth
  currentUser: SystemUser;
  switchUserRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  login: (identifier: string, password?: string) => { success: boolean; message: string };
  logout: () => void;

  // Data Collections
  customers: Customer[];
  metro: Metro[];
  publicIps: PublicIp[];
  pricingConfig: PricingConfig;
  services: ServiceItem[];
  quotations: Quotation[];
  invoices: Invoice[];
  users: SystemUser[];
  auditLogs: AuditLog[];
  toasts: ToastMessage[];

  // Mutations
  addCustomer: (data: Omit<Customer, 'id' | 'createdAt'>) => string;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  updatePricingConfig: (config: Partial<PricingConfig>) => void;
  saveBandwidthTier: (tier: BandwidthTier) => void;
  deleteBandwidthTier: (tierId: string) => void;
  toggleBandwidthTier: (tierId: string) => void;

  addMetro: (metro: Omit<Metro, 'id'>) => void;
  updateMetro: (id: string, metro: Partial<Metro>) => void;
  deleteMetro: (id: string) => void;

  addPublicIp: (ip: Omit<PublicIp, 'id'>) => void;
  updatePublicIp: (id: string, ip: Partial<PublicIp>) => void;
  deletePublicIp: (id: string) => void;

  createService: (
    service: Omit<ServiceItem, 'id' | 'createdAt'>,
    createQuotationAlso?: boolean
  ) => { serviceId: string; quotationId?: string };
  updateServiceStatus: (id: string, status: 'Aktif' | 'Nonaktif' | 'Suspended') => void;

  createQuotation: (quotation: Omit<Quotation, 'id' | 'createdAt'>) => string;
  updateQuotationStatus: (id: string, status: QuotationStatus) => void;
  convertQuotationToInvoice: (quotationId: string, dueDate: string) => string;

  recordPayment: (invoiceId: string, payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => void;
  updateInvoiceStatus: (id: string, status: InvoicePaymentStatus) => void;
  addInvoice: (data: any) => string;

  addUser: (data: any) => void;
  updateUser: (id: string, data: any) => void;
  deleteUser: (id: string) => void;

  // Marketing Fee & Withdrawals
  withdrawals: FeeWithdrawalRecord[];
  addWithdrawal: (record: Omit<FeeWithdrawalRecord, 'id'>) => void;
  updateWithdrawalStatus: (id: string, status: 'Pending' | 'Paid') => void;

  // Feedback
  addToast: (type: ToastMessage['type'], message: string) => void;
  removeToast: (id: string) => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial from localStorage or defaults
  const loadStored = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${key}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading stored state', e);
    }
    return fallback;
  };

  const [activeMenu, setActiveMenu] = useState<ActiveMenu>('dashboard');
  const [selectedCustomerIdForDetail, setSelectedCustomerIdForDetail] = useState<string | null>(null);

  const [customers, setCustomers] = useState<Customer[]>(() =>
    loadStored('customers', INITIAL_CUSTOMERS)
  );
  const [metro, setMetro] = useState<Metro[]>(() =>
    loadStored('metro', INITIAL_METRO)
  );
  const [publicIps, setPublicIps] = useState<PublicIp[]>(() =>
    loadStored('publicIps', INITIAL_PUBLIC_IPS)
  );
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(() => {
    const loaded = loadStored('pricingConfig', INITIAL_PRICING);
    if (!loaded.bandwidthTiers || loaded.bandwidthTiers.length === 0) {
      return {
        ...loaded,
        bandwidthTiers: INITIAL_PRICING.bandwidthTiers,
      };
    }
    return loaded;
  });
  const [services, setServices] = useState<ServiceItem[]>(() =>
    loadStored('services', INITIAL_SERVICES)
  );
  const [quotations, setQuotations] = useState<Quotation[]>(() =>
    loadStored('quotations', INITIAL_QUOTATIONS)
  );
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    loadStored('invoices', INITIAL_INVOICES)
  );
  const [withdrawals, setWithdrawals] = useState<FeeWithdrawalRecord[]>(() =>
    loadStored('withdrawals', INITIAL_WITHDRAWAL_RECORDS)
  );
  const [users, setUsers] = useState<SystemUser[]>(() =>
    loadStored('users', INITIAL_USERS)
  );
  const [currentUser, setCurrentUser] = useState<SystemUser>(() =>
    loadStored('currentUser', INITIAL_USERS[0])
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    loadStored('isAuthenticated', true)
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    loadStored('auditLogs', INITIAL_AUDIT_LOGS)
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_withdrawals`, JSON.stringify(withdrawals));
  }, [withdrawals]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_metro`, JSON.stringify(metro));
  }, [metro]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_publicIps`, JSON.stringify(publicIps));
  }, [publicIps]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_pricingConfig`, JSON.stringify(pricingConfig));
  }, [pricingConfig]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_services`, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_quotations`, JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_auditLogs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_isAuthenticated`, JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  // Toast helper
  const addToast = (type: ToastMessage['type'], message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Audit log helper
  const logAudit = (
    action: string,
    module: AuditLog['module'],
    recordId: string,
    description: string
  ) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: currentUser.name,
      userName: currentUser.name,
      role: currentUser.role,
      userRole: currentUser.role,
      action,
      module,
      recordId,
      description,
      details: description,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Switch role
  const switchUserRole = (role: UserRole) => {
    const found = users.find((u) => u.role === role) || {
      id: `USR-${role}`,
      name: `${role} User`,
      email: `${role.toLowerCase()}@anten.net.id`,
      role,
      status: 'Aktif',
    };
    setCurrentUser(found);
    setIsAuthenticated(true);
    addToast('info', `Beralih peran ke ${role}`);
  };

  // Login handler
  const login = (identifier: string, password?: string): { success: boolean; message: string } => {
    const clean = identifier.trim().toLowerCase();
    const foundUser = users.find(
      (u) =>
        u.username.toLowerCase() === clean ||
        u.email.toLowerCase() === clean
    );

    if (!foundUser) {
      return {
        success: false,
        message: 'Username atau email tidak terdaftar dalam sistem.',
      };
    }

    if (foundUser.status === 'Tidak Aktif' || foundUser.status === 'Nonaktif') {
      return {
        success: false,
        message: 'Akun Anda sedang dinonaktifkan. Silakan hubungi Administrator.',
      };
    }

    // Password verification (check matched password, or fallback demo passwords: admin123, finance123, sales123, noc123, anten123)
    if (password && password.trim()) {
      const p = password.trim();
      const validDemoPasswords = ['anten123', 'admin123', 'finance123', 'sales123', 'noc123'];
      if (foundUser.password && foundUser.password !== p && !validDemoPasswords.includes(p)) {
        return {
          success: false,
          message: 'Kata sandi (password) salah. Silakan periksa kembali.',
        };
      }
    }

    setCurrentUser(foundUser);
    setIsAuthenticated(true);
    logAudit(
      'User Login',
      'User',
      foundUser.id,
      `Pengguna ${foundUser.name} (${foundUser.role}) berhasil masuk ke sistem.`
    );
    addToast('success', `Selamat datang kembali, ${foundUser.name}!`);
    return { success: true, message: 'Berhasil masuk.' };
  };

  // Logout handler
  const logout = () => {
    if (currentUser) {
      logAudit(
        'User Logout',
        'User',
        currentUser.id,
        `Pengguna ${currentUser.name} telah keluar dari sesi sistem.`
      );
    }
    setIsAuthenticated(false);
    addToast('info', 'Anda telah berhasil keluar dari sistem ANTEN.');
  };

  // Customer Actions
  const addCustomer = (data: Omit<Customer, 'id' | 'createdAt'>): string => {
    const nextSeq = customers.length + 1;
    const newId = `CUS-2026-${String(nextSeq).padStart(5, '0')}`;
    const newCustomer: Customer = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    logAudit('Created Customer', 'Customer', newId, `Menambahkan pelanggan baru ${newCustomer.companyName} (${newCustomer.fullName})`);
    addToast('success', `Pelanggan ${newCustomer.companyName} berhasil ditambahkan.`);
    return newId;
  };

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    );
    logAudit('Updated Customer', 'Customer', id, `Memperbarui informasi pelanggan ${id}`);
    addToast('success', `Data pelanggan ${id} berhasil diperbarui.`);
  };

  const deleteCustomer = (id: string) => {
    const customer = customers.find((c) => c.id === id);
    if (!customer) return;
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    logAudit('Deleted Customer', 'Customer', id, `Menghapus data pelanggan ${customer.companyName}`);
    addToast('warning', `Pelanggan ${customer.companyName} telah dihapus.`);
  };

  const openCustomerDetail = (customerId: string) => {
    setSelectedCustomerIdForDetail(customerId);
  };

  const closeCustomerDetail = () => {
    setSelectedCustomerIdForDetail(null);
  };

  // Pricing Config
  const updatePricingConfig = (config: Partial<PricingConfig>) => {
    setPricingConfig((prev) => ({ ...prev, ...config }));
    logAudit('Updated Pricing', 'Pricing', 'BASE-PRICING', `Memperbarui master konfigurasi pricing internet`);
    addToast('success', 'Master Pricing internet berhasil disimpan.');
  };

  const saveBandwidthTier = (tierData: BandwidthTier) => {
    setPricingConfig((prev) => {
      const existingTiers = prev.bandwidthTiers || [];
      const existingIndex = existingTiers.findIndex((t) => t.id === tierData.id);
      let updatedTiers: BandwidthTier[];
      if (existingIndex >= 0) {
        updatedTiers = [...existingTiers];
        updatedTiers[existingIndex] = tierData;
      } else {
        const sameBwIndex = existingTiers.findIndex((t) => t.bandwidthMbps === tierData.bandwidthMbps);
        if (sameBwIndex >= 0) {
          updatedTiers = [...existingTiers];
          updatedTiers[sameBwIndex] = tierData;
        } else {
          updatedTiers = [...existingTiers, tierData];
        }
      }
      updatedTiers.sort((a, b) => a.bandwidthMbps - b.bandwidthMbps);
      return { ...prev, bandwidthTiers: updatedTiers };
    });
    const label = tierData.bandwidthMbps >= 1000 ? `${tierData.bandwidthMbps / 1000} Gbps` : `${tierData.bandwidthMbps} Mbps`;
    logAudit('Updated Bandwidth Tier', 'Pricing', tierData.id, `Menyimpan tarif bandwidth ${label}: Rp ${tierData.price.toLocaleString('id-ID')}`);
    addToast('success', `Tarif internet untuk kapasitas ${label} berhasil disimpan.`);
  };

  const deleteBandwidthTier = (tierId: string) => {
    setPricingConfig((prev) => ({
      ...prev,
      bandwidthTiers: (prev.bandwidthTiers || []).filter((t) => t.id !== tierId),
    }));
    logAudit('Deleted Bandwidth Tier', 'Pricing', tierId, `Menghapus tarif bandwidth tier ${tierId}`);
    addToast('warning', 'Tarif kapasitas bandwidth telah dihapus.');
  };

  const toggleBandwidthTier = (tierId: string) => {
    setPricingConfig((prev) => ({
      ...prev,
      bandwidthTiers: (prev.bandwidthTiers || []).map((t) =>
        t.id === tierId ? { ...t, isActive: !t.isActive } : t
      ),
    }));
  };

  // Metro Actions
  const addMetro = (metroData: Omit<Metro, 'id'>) => {
    const newId = `MTR-${String(metro.length + 1).padStart(3, '0')}`;
    const newMetro: Metro = { ...metroData, id: newId };
    setMetro((prev) => [...prev, newMetro]);
    logAudit('Created Metro', 'Metro', newId, `Menambahkan metro baru ${newMetro.name} (${newMetro.priceMethod})`);
    addToast('success', `Metro ${newMetro.name} berhasil ditambahkan.`);
  };

  const updateMetro = (id: string, partial: Partial<Metro>) => {
    setMetro((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...partial } : m))
    );
    logAudit('Updated Metro', 'Metro', id, `Memperbarui konfigurasi Metro ${id}`);
    addToast('success', `Metro ${id} berhasil diperbarui.`);
  };

  const deleteMetro = (id: string) => {
    const target = metro.find((m) => m.id === id);
    setMetro((prev) => prev.filter((m) => m.id !== id));
    logAudit('Deleted Metro', 'Metro', id, `Menghapus Metro ${target?.name || id}`);
    addToast('warning', `Metro ${target?.name || id} telah dihapus.`);
  };

  // Public IP Actions
  const addPublicIp = (ipData: Omit<PublicIp, 'id'>) => {
    const newId = `PIP-${String(publicIps.length + 1).padStart(3, '0')}`;
    const newIp: PublicIp = { ...ipData, id: newId };
    setPublicIps((prev) => [...prev, newIp]);
    logAudit('Created Public IP', 'Public IP', newId, `Menambahkan prefix Public IP ${newIp.prefix}`);
    addToast('success', `Prefix ${newIp.prefix} berhasil ditambahkan.`);
  };

  const updatePublicIp = (id: string, partial: Partial<PublicIp>) => {
    setPublicIps((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...partial } : p))
    );
    logAudit('Updated Public IP', 'Public IP', id, `Memperbarui Public IP ${id}`);
    addToast('success', `Public IP ${id} berhasil diperbarui.`);
  };

  const deletePublicIp = (id: string) => {
    const target = publicIps.find((p) => p.id === id);
    setPublicIps((prev) => prev.filter((p) => p.id !== id));
    logAudit('Deleted Public IP', 'Public IP', id, `Menghapus Public IP prefix ${target?.prefix || id}`);
    addToast('warning', `Prefix Public IP ${target?.prefix || id} dihapus.`);
  };

  // Services Actions
  const createService = (
    serviceData: Omit<ServiceItem, 'id' | 'createdAt'>,
    createQuotationAlso = false
  ): { serviceId: string; quotationId?: string } => {
    const nextSeq = services.length + 1;
    const serviceId = `SRV-2026-${String(nextSeq).padStart(5, '0')}`;
    const newService: ServiceItem = {
      ...serviceData,
      id: serviceId,
      createdAt: new Date().toISOString(),
    };
    setServices((prev) => [newService, ...prev]);

    const cust = customers.find((c) => c.id === serviceData.customerId);
    logAudit('Created Service', 'Service', serviceId, `Membuat layanan baru ${serviceData.bandwidthMbps} Mbps untuk ${cust?.companyName || serviceData.customerId}`);
    addToast('success', `Layanan ${serviceId} berhasil dibuat.`);

    let quotationId: string | undefined = undefined;
    if (createQuotationAlso) {
      const qSeq = quotations.length + 1;
      quotationId = `QT-2026-${String(qSeq).padStart(5, '0')}`;
      const newQuotation: Quotation = {
        id: quotationId,
        date: new Date().toISOString().slice(0, 10),
        customerId: serviceData.customerId,
        serviceId: serviceId,
        bandwidthMbps: serviceData.bandwidthMbps,
        metroId: serviceData.metroId,
        publicIpId: serviceData.publicIpId,
        internetCost: serviceData.internetCost,
        metroCost: serviceData.metroCost,
        publicIpCost: serviceData.publicIpCost,
        subtotal: serviceData.subtotal,
        discountType: serviceData.discountType,
        discountValue: serviceData.discountValue,
        discountAmount: serviceData.discountAmount,
        dpp: serviceData.dpp,
        ppnAmount: serviceData.ppnAmount,
        total: serviceData.totalMonthly,
        pricingAllocation: serviceData.pricingAllocation,
        status: 'Draft',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        notes: serviceData.notes,
        createdAt: new Date().toISOString(),
      };
      setQuotations((prev) => [newQuotation, ...prev]);
      logAudit('Created Quotation', 'Quotation', quotationId, `Membuat draft quotation otomatis dari layanan ${serviceId}`);
      addToast('info', `Quotation ${quotationId} otomatis dibuat.`);
    }

    return { serviceId, quotationId };
  };

  const updateServiceStatus = (id: string, status: 'Aktif' | 'Nonaktif' | 'Suspended') => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
    logAudit('Updated Service', 'Service', id, `Mengubah status layanan ${id} menjadi ${status}`);
    addToast('info', `Status layanan ${id} diubah menjadi ${status}`);
  };

  // Quotation Actions
  const createQuotation = (quotationData: Omit<Quotation, 'id' | 'createdAt'>): string => {
    const nextSeq = quotations.length + 1;
    const newId = `QT-2026-${String(nextSeq).padStart(5, '0')}`;
    const newQuote: Quotation = {
      ...quotationData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setQuotations((prev) => [newQuote, ...prev]);
    const cust = customers.find((c) => c.id === quotationData.customerId);
    logAudit('Created Quotation', 'Quotation', newId, `Membuat penawaran harga untuk ${cust?.companyName || quotationData.customerId}`);
    addToast('success', `Quotation ${newId} berhasil dibuat.`);
    return newId;
  };

  const updateQuotationStatus = (id: string, status: QuotationStatus) => {
    setQuotations((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status } : q))
    );
    logAudit('Updated Quotation', 'Quotation', id, `Mengubah status Quotation ${id} menjadi ${status}`);
    addToast('info', `Status penawaran ${id} menjadi ${status}`);
  };

  const convertQuotationToInvoice = (quotationId: string, dueDate: string): string => {
    const quote = quotations.find((q) => q.id === quotationId);
    if (!quote) throw new Error('Quotation not found');

    const nextSeq = invoices.length + 1;
    const newInvoiceId = `INV-2026-${String(nextSeq).padStart(5, '0')}`;
    const cust = customers.find((c) => c.id === quote.customerId);
    const metroObj = metro.find((m) => m.id === quote.metroId);
    const ipObj = publicIps.find((p) => p.id === quote.publicIpId);

    const newInvoice: Invoice = {
      id: newInvoiceId,
      customerId: quote.customerId,
      serviceId: quote.serviceId,
      quotationId: quote.id,
      serviceDescription: `Dedicated Internet ${quote.bandwidthMbps} Mbps + ${metroObj?.name || 'Metro'} + IP ${ipObj?.prefix || '-'}`,
      billingPeriod: new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' }),
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      subtotal: quote.subtotal,
      discountAmount: quote.discountAmount,
      dpp: quote.dpp,
      ppnAmount: quote.ppnAmount,
      total: quote.total,
      paidAmount: 0,
      paymentStatus: 'Unpaid',
      payments: [],
      notes: `Diterbitkan dari Quotation ${quote.id}`,
      createdAt: new Date().toISOString(),
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    // update quotation to Accepted
    updateQuotationStatus(quotationId, 'Accepted');
    logAudit('Generated Invoice', 'Invoice', newInvoiceId, `Menerbitkan Invoice ${newInvoiceId} untuk ${cust?.companyName} berdasarkan Quotation ${quote.id}`);
    addToast('success', `Invoice ${newInvoiceId} berhasil diterbitkan.`);
    return newInvoiceId;
  };

  // Payment Recording
  const recordPayment = (
    invoiceId: string,
    paymentData: Omit<PaymentRecord, 'id' | 'createdAt'>
  ) => {
    const targetInvoice = invoices.find((inv) => inv.id === invoiceId);
    if (!targetInvoice) return;

    const newPaymentId = `PAY-${Date.now().toString().slice(-6)}`;
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: newPaymentId,
      createdAt: new Date().toISOString(),
    };

    const newTotalPaid = targetInvoice.paidAmount + paymentData.amount;
    let newStatus: InvoicePaymentStatus = targetInvoice.paymentStatus;

    if (newTotalPaid >= targetInvoice.total) {
      newStatus = 'Paid';
    } else if (newTotalPaid > 0) {
      newStatus = 'Partially Paid';
    }

    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              paidAmount: newTotalPaid,
              paymentStatus: newStatus,
              payments: [...inv.payments, newPayment],
            }
          : inv
      )
    );

    const cust = customers.find((c) => c.id === targetInvoice.customerId);
    logAudit(
      'Recorded Payment',
      'Payment',
      invoiceId,
      `Penerimaan pembayaran ${paymentData.amount.toLocaleString('id-ID')} via ${paymentData.paymentMethod} (${cust?.companyName || targetInvoice.customerId})`
    );
    addToast(
      'success',
      `Pembayaran berhasil dicatat. Status tagihan sekarang: ${newStatus}.`
    );
  };

  const updateInvoiceStatus = (id: string, status: InvoicePaymentStatus) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, paymentStatus: status } : inv))
    );
    logAudit('Updated Invoice', 'Invoice', id, `Mengubah status invoice ${id} menjadi ${status}`);
    addToast('info', `Status tagihan ${id} diubah ke ${status}`);
  };

  const addInvoice = (data: any): string => {
    const nextSeq = invoices.length + 1;
    const newId = `INV-2026-${String(nextSeq).padStart(5, '0')}`;
    const newInvoice: Invoice = {
      id: newId,
      customerId: data.customerId,
      serviceId: data.serviceId,
      serviceDescription: data.serviceDescription || 'Layanan Dedicated Internet ISP',
      billingPeriod: data.billingPeriod,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      subtotal: data.subtotal,
      discountAmount: data.discountAmount || 0,
      dpp: data.dpp,
      ppnAmount: data.ppnAmount,
      total: data.total,
      paidAmount: data.paidAmount || 0,
      paymentStatus: data.paymentStatus || 'Unpaid',
      payments: data.paymentHistory || data.payments || [],
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    logAudit('Created Invoice', 'Invoice', newId, `Menerbitkan tagihan baru ${newId} periode ${data.billingPeriod}`);
    addToast('success', `Invoice tagihan ${newId} berhasil diterbitkan.`);
    return newId;
  };

  const addUser = (data: any) => {
    const nextSeq = users.length + 1;
    const newId = `USR-${String(nextSeq).padStart(3, '0')}`;
    const newUser: SystemUser = {
      id: newId,
      name: data.name,
      username: data.username,
      email: data.email,
      role: data.role,
      status: data.status,
    };
    setUsers((prev) => [...prev, newUser]);
    logAudit('Created User', 'System', newId, `Menambahkan staf pengguna ${data.name} (${data.role})`);
    addToast('success', `Akun staf ${data.name} berhasil dibuat.`);
  };

  const updateUser = (id: string, data: any) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
    logAudit('Updated User', 'System', id, `Memperbarui data akun staf ${data.name || id}`);
    addToast('success', 'Data staf berhasil diperbarui.');
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    logAudit('Deleted User', 'System', id, `Menghapus akun staf ${id}`);
    addToast('warning', 'Akun staf telah dihapus.');
  };

  // Withdrawal & Marketing Fee Actions
  const addWithdrawal = (record: Omit<FeeWithdrawalRecord, 'id'>) => {
    const nextSeq = withdrawals.length + 1;
    const newId = `WDR-2026-${String(nextSeq).padStart(3, '0')}`;
    const newRecord: FeeWithdrawalRecord = {
      ...record,
      id: newId,
    };
    setWithdrawals((prev) => [newRecord, ...prev]);
    logAudit(
      'Requested Fee Withdrawal',
      'Marketing Fee',
      newId,
      `Pengajuan pencairan komisi ${record.recipientName} (${record.recipientRole}) sebesar Rp ${record.amount.toLocaleString('id-ID')}`
    );
    addToast('success', `Pengajuan pencairan fee ${newId} berhasil dikirim.`);
  };

  const updateWithdrawalStatus = (id: string, status: 'Pending' | 'Paid') => {
    setWithdrawals((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              status,
              paymentDate: status === 'Paid' ? new Date().toISOString().slice(0, 10) : undefined,
            }
          : w
      )
    );
    logAudit(
      'Updated Fee Withdrawal Status',
      'Marketing Fee',
      id,
      `Memperbarui status pencairan fee ${id} menjadi ${status}`
    );
    addToast('success', `Status pencairan ${id} diubah menjadi ${status}.`);
  };

  // Reset to default demo data
  const resetDemoData = () => {
    setCustomers(INITIAL_CUSTOMERS);
    setMetro(INITIAL_METRO);
    setPublicIps(INITIAL_PUBLIC_IPS);
    setPricingConfig(INITIAL_PRICING);
    setServices(INITIAL_SERVICES);
    setQuotations(INITIAL_QUOTATIONS);
    setInvoices(INITIAL_INVOICES);
    setWithdrawals(INITIAL_WITHDRAWAL_RECORDS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.clear();
    addToast('info', 'Data demo telah direset ke pengaturan awal.');
  };

  return (
    <AppContext.Provider
      value={{
        activeMenu,
        setActiveMenu,
        selectedCustomerIdForDetail,
        openCustomerDetail,
        closeCustomerDetail,
        currentUser,
        switchUserRole,
        isAuthenticated,
        login,
        logout,
        customers,
        metro,
        publicIps,
        pricingConfig,
        services,
        quotations,
        invoices,
        withdrawals,
        addWithdrawal,
        updateWithdrawalStatus,
        users,
        auditLogs,
        toasts,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        updatePricingConfig,
        saveBandwidthTier,
        deleteBandwidthTier,
        toggleBandwidthTier,
        addMetro,
        updateMetro,
        deleteMetro,
        addPublicIp,
        updatePublicIp,
        deletePublicIp,
        createService,
        updateServiceStatus,
        createQuotation,
        updateQuotationStatus,
        convertQuotationToInvoice,
        recordPayment,
        updateInvoiceStatus,
        addInvoice,
        addUser,
        updateUser,
        deleteUser,
        addToast,
        removeToast,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
