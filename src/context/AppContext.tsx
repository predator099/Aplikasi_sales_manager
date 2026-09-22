import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Customer,
  Metro,
  PublicIp,
  PricingConfig,
  CalculationFormulaConfig,
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
  DEFAULT_FORMULA_CONFIG,
  INITIAL_SERVICES,
  INITIAL_QUOTATIONS,
  INITIAL_INVOICES,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_WITHDRAWAL_RECORDS,
} from '../data/initialData';
import { apiService } from '../services/apiService';

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
  formulaConfig: CalculationFormulaConfig;
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

  updateFormulaConfig: (config: Partial<CalculationFormulaConfig>) => void;
  resetFormulaConfigToDefault: () => void;

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
  convertQuotationToInvoice: (quotationId: string, dueDate?: string) => string;

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

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const loaded = loadStored<Customer[]>('customers', INITIAL_CUSTOMERS);
    // Merge with INITIAL_CUSTOMERS to ensure new fields are populated if stored before
    return loaded.map((c) => {
      const matchInitial = INITIAL_CUSTOMERS.find((init) => init.id === c.id);
      return {
        ...matchInitial,
        ...c,
        salesName: c.salesName || matchInitial?.salesName || 'Rian Pratama',
        salesPhone: c.salesPhone || matchInitial?.salesPhone || '081298765432',
        picTechnicalPhone: c.picTechnicalPhone || matchInitial?.picTechnicalPhone || '081211223344',
        picFinanceName: c.picFinanceName || matchInitial?.picFinanceName || 'Ratna Wulandari',
        picFinancePhone: c.picFinancePhone || matchInitial?.picFinancePhone || '081255667788',
        subscriptionPeriod: c.subscriptionPeriod || matchInitial?.subscriptionPeriod || '12 Bulan (1 Tahun)',
        responsiblePerson: c.responsiblePerson || matchInitial?.responsiblePerson || c.fullName,
        responsiblePersonPhone: c.responsiblePersonPhone || matchInitial?.responsiblePersonPhone || c.whatsapp,
        npwpDocument: c.npwpDocument !== undefined ? c.npwpDocument : (matchInitial?.npwpDocument || null),
        nibDocument: c.nibDocument !== undefined ? c.nibDocument : (matchInitial?.nibDocument || null),
      };
    });
  });
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
  const [formulaConfig, setFormulaConfig] = useState<CalculationFormulaConfig>(() =>
    loadStored('formulaConfig', DEFAULT_FORMULA_CONFIG)
  );
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
    localStorage.setItem(`${STORAGE_KEY}_formulaConfig`, JSON.stringify(formulaConfig));
  }, [formulaConfig]);

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

  // Initial Sync from PostgreSQL Server API
  useEffect(() => {
    let isMounted = true;
    const syncData = async () => {
      try {
        const [
          serverCustomers,
          serverServices,
          serverQuotes,
          serverInvoices,
          serverWithdrawals,
          serverMetros,
          serverPublicIps,
          serverPricing,
          serverFormula,
          serverUsers,
          serverLogs,
        ] = await Promise.allSettled([
          apiService.getCustomers(),
          apiService.getServices(),
          apiService.getQuotations(),
          apiService.getInvoices(),
          apiService.getWithdrawals(),
          apiService.getMetros(),
          apiService.getPublicIps(),
          apiService.getPricing(),
          apiService.getFormula(),
          apiService.getUsers(),
          apiService.getAuditLogs(),
        ]);

        if (!isMounted) return;

        if (serverCustomers.status === 'fulfilled' && Array.isArray(serverCustomers.value) && serverCustomers.value.length > 0) {
          setCustomers(serverCustomers.value);
        }
        if (serverServices.status === 'fulfilled' && Array.isArray(serverServices.value) && serverServices.value.length > 0) {
          setServices(serverServices.value);
        }
        if (serverQuotes.status === 'fulfilled' && Array.isArray(serverQuotes.value) && serverQuotes.value.length > 0) {
          setQuotations(serverQuotes.value);
        }
        if (serverInvoices.status === 'fulfilled' && Array.isArray(serverInvoices.value) && serverInvoices.value.length > 0) {
          setInvoices(serverInvoices.value);
        }
        if (serverWithdrawals.status === 'fulfilled' && Array.isArray(serverWithdrawals.value) && serverWithdrawals.value.length > 0) {
          setWithdrawals(serverWithdrawals.value);
        }
        if (serverMetros.status === 'fulfilled' && Array.isArray(serverMetros.value) && serverMetros.value.length > 0) {
          setMetro(serverMetros.value);
        }
        if (serverPublicIps.status === 'fulfilled' && Array.isArray(serverPublicIps.value) && serverPublicIps.value.length > 0) {
          setPublicIps(serverPublicIps.value);
        }
        if (serverPricing.status === 'fulfilled' && serverPricing.value) {
          setPricingConfig(serverPricing.value);
        }
        if (serverFormula.status === 'fulfilled' && serverFormula.value) {
          setFormulaConfig(serverFormula.value);
        }
        if (serverUsers.status === 'fulfilled' && Array.isArray(serverUsers.value) && serverUsers.value.length > 0) {
          setUsers(serverUsers.value);
        }
        if (serverLogs.status === 'fulfilled' && Array.isArray(serverLogs.value) && serverLogs.value.length > 0) {
          setAuditLogs(serverLogs.value);
        }
      } catch (err) {
        console.warn('Sync from API server fallback to local state', err);
      }
    };

    syncData();
    return () => {
      isMounted = false;
    };
  }, []);

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
    apiService.createAuditLog(newLog).catch(() => {});
  };

  // Switch role
  const switchUserRole = (role: UserRole) => {
    const found = users.find((u) => u.role === role) || {
      id: `USR-${role}`,
      name: `${role} User`,
      username: `${role.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      email: `${role.toLowerCase().replace(/[^a-z0-9]/g, '')}@anten.net.id`,
      role,
      status: 'Aktif' as const,
    };
    setCurrentUser(found);
    setIsAuthenticated(true);
    apiService.switchRole(role).catch(() => {});
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
      const validDemoPasswords = ['anten123', 'admin123', 'finance123', 'sales123', 'noc123', 'Admin123!'];
      if (foundUser.password && foundUser.password !== p && !validDemoPasswords.includes(p)) {
        return {
          success: false,
          message: 'Kata sandi (password) salah. Silakan periksa kembali.',
        };
      }
    }

    setCurrentUser(foundUser);
    setIsAuthenticated(true);
    apiService.login(identifier, password).catch(() => {});
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
    apiService.logout().catch(() => {});
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
    apiService.createCustomer(newCustomer).catch(() => {});
    logAudit('Created Customer', 'Customer', newId, `Menambahkan pelanggan baru ${newCustomer.companyName} (${newCustomer.fullName})`);
    addToast('success', `Pelanggan ${newCustomer.companyName} berhasil ditambahkan.`);
    return newId;
  };

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    );
    apiService.updateCustomer(id, data).catch(() => {});
    logAudit('Updated Customer', 'Customer', id, `Memperbarui informasi pelanggan ${id}`);
    addToast('success', `Data pelanggan ${id} berhasil diperbarui.`);
  };

  const deleteCustomer = (id: string) => {
    const customer = customers.find((c) => c.id === id);
    if (!customer) return;
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    apiService.deleteCustomer(id).catch(() => {});
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
    apiService.updatePricing(config).catch(() => {});
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
    apiService.saveBandwidthTier(tierData).catch(() => {});
    const label = tierData.bandwidthMbps >= 1000 ? `${tierData.bandwidthMbps / 1000} Gbps` : `${tierData.bandwidthMbps} Mbps`;
    logAudit('Updated Bandwidth Tier', 'Pricing', tierData.id, `Menyimpan tarif bandwidth ${label}: Rp ${tierData.price.toLocaleString('id-ID')}`);
    addToast('success', `Tarif internet untuk kapasitas ${label} berhasil disimpan.`);
  };

  const deleteBandwidthTier = (tierId: string) => {
    setPricingConfig((prev) => ({
      ...prev,
      bandwidthTiers: (prev.bandwidthTiers || []).filter((t) => t.id !== tierId),
    }));
    apiService.deleteBandwidthTier(tierId).catch(() => {});
    logAudit('Deleted Bandwidth Tier', 'Pricing', tierId, `Menghapus tarif bandwidth tier ${tierId}`);
    addToast('warning', 'Tarif kapasitas bandwidth telah dihapus.');
  };

  const toggleBandwidthTier = (tierId: string) => {
    setPricingConfig((prev) => {
      const updated = {
        ...prev,
        bandwidthTiers: (prev.bandwidthTiers || []).map((t) =>
          t.id === tierId ? { ...t, isActive: !t.isActive } : t
        ),
      };
      apiService.updatePricing(updated).catch(() => {});
      return updated;
    });
  };

  // Formula Calculation Config Actions (Admin level)
  const updateFormulaConfig = (config: Partial<CalculationFormulaConfig>) => {
    setFormulaConfig((prev) => {
      const updated: CalculationFormulaConfig = {
        ...prev,
        ...config,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.name || 'Administrator',
      };
      apiService.updateFormula(updated).catch(() => {});
      return updated;
    });
    logAudit(
      'Updated Formula Config',
      'Pricing',
      'CALC-FORMULA',
      `Administrator ${currentUser.name} memperbarui rumus Internet Metro & Fee Sales (Kantor: ${config.kantorPercentage ?? formulaConfig.kantorPercentage}%, Pool: ${config.marketingPoolPercentage ?? formulaConfig.marketingPoolPercentage}%, Sales: ${config.salesPercentageOfPool ?? formulaConfig.salesPercentageOfPool}%, Metro: ${config.metroCalculationMethod ?? formulaConfig.metroCalculationMethod})`
    );
    addToast('success', 'Rumus perhitungan Internet Metro dan Fee Sales berhasil diperbarui.');
  };

  const resetFormulaConfigToDefault = () => {
    const resetVal = {
      ...DEFAULT_FORMULA_CONFIG,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.name || 'Administrator',
    };
    setFormulaConfig(resetVal);
    apiService.updateFormula(resetVal).catch(() => {});
    logAudit(
      'Reset Formula Config',
      'Pricing',
      'CALC-FORMULA',
      `Administrator ${currentUser.name} mengembalikan seluruh rumus perhitungan ke standar default ISP`
    );
    addToast('info', 'Rumus perhitungan telah dikembalikan ke standar default.');
  };

  // Metro Actions
  const addMetro = (metroData: Omit<Metro, 'id'>) => {
    const newId = `MTR-${String(metro.length + 1).padStart(3, '0')}`;
    const newMetro: Metro = { ...metroData, id: newId };
    setMetro((prev) => [...prev, newMetro]);
    apiService.createMetro(newMetro).catch(() => {});
    logAudit('Created Metro', 'Metro', newId, `Menambahkan metro baru ${newMetro.name} (${newMetro.priceMethod})`);
    addToast('success', `Metro ${newMetro.name} berhasil ditambahkan.`);
  };

  const updateMetro = (id: string, partial: Partial<Metro>) => {
    setMetro((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...partial } : m))
    );
    apiService.updateMetro(id, partial).catch(() => {});
    logAudit('Updated Metro', 'Metro', id, `Memperbarui konfigurasi Metro ${id}`);
    addToast('success', `Metro ${id} berhasil diperbarui.`);
  };

  const deleteMetro = (id: string) => {
    const target = metro.find((m) => m.id === id);
    setMetro((prev) => prev.filter((m) => m.id !== id));
    apiService.deleteMetro(id).catch(() => {});
    logAudit('Deleted Metro', 'Metro', id, `Menghapus Metro ${target?.name || id}`);
    addToast('warning', `Metro ${target?.name || id} telah dihapus.`);
  };

  // Public IP Actions
  const addPublicIp = (ipData: Omit<PublicIp, 'id'>) => {
    const newId = `PIP-${String(publicIps.length + 1).padStart(3, '0')}`;
    const newIp: PublicIp = { ...ipData, id: newId };
    setPublicIps((prev) => [...prev, newIp]);
    apiService.createPublicIp(newIp).catch(() => {});
    logAudit('Created Public IP', 'Public IP', newId, `Menambahkan prefix Public IP ${newIp.prefix}`);
    addToast('success', `Prefix ${newIp.prefix} berhasil ditambahkan.`);
  };

  const updatePublicIp = (id: string, partial: Partial<PublicIp>) => {
    setPublicIps((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...partial } : p))
    );
    apiService.updatePublicIp(id, partial).catch(() => {});
    logAudit('Updated Public IP', 'Public IP', id, `Memperbarui Public IP ${id}`);
    addToast('success', `Public IP ${id} berhasil diperbarui.`);
  };

  const deletePublicIp = (id: string) => {
    const target = publicIps.find((p) => p.id === id);
    setPublicIps((prev) => prev.filter((p) => p.id !== id));
    apiService.deletePublicIp(id).catch(() => {});
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
    apiService.createService(newService, createQuotationAlso).catch(() => {});

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
      apiService.createQuotation(newQuotation).catch(() => {});
      logAudit('Created Quotation', 'Quotation', quotationId, `Membuat draft quotation otomatis dari layanan ${serviceId}`);
      addToast('info', `Quotation ${quotationId} otomatis dibuat.`);
    }

    return { serviceId, quotationId };
  };

  const updateServiceStatus = (id: string, status: 'Aktif' | 'Nonaktif' | 'Suspended') => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
    apiService.updateServiceStatus(id, status).catch(() => {});
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
    apiService.createQuotation(newQuote).catch(() => {});
    const cust = customers.find((c) => c.id === quotationData.customerId);
    logAudit('Created Quotation', 'Quotation', newId, `Membuat penawaran harga untuk ${cust?.companyName || quotationData.customerId}`);
    addToast('success', `Quotation ${newId} berhasil dibuat.`);
    return newId;
  };

  const updateQuotationStatus = (id: string, status: QuotationStatus) => {
    setQuotations((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status } : q))
    );
    apiService.updateQuotationStatus(id, status).catch(() => {});
    logAudit('Updated Quotation', 'Quotation', id, `Mengubah status Quotation ${id} menjadi ${status}`);
    addToast('info', `Status penawaran ${id} menjadi ${status}`);
  };

  const convertQuotationToInvoice = (quotationId: string, dueDate?: string): string => {
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
    apiService.convertQuotationToInvoice(quotationId, dueDate).catch(() => {});
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

    apiService.recordPayment(invoiceId, paymentData).catch(() => {});

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
    apiService.createInvoice(newInvoice).catch(() => {});
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
    apiService.createUser(newUser).catch(() => {});
    logAudit('Created User', 'System', newId, `Menambahkan staf pengguna ${data.name} (${data.role})`);
    addToast('success', `Akun staf ${data.name} berhasil dibuat.`);
  };

  const updateUser = (id: string, data: any) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
    apiService.updateUser(id, data).catch(() => {});
    logAudit('Updated User', 'System', id, `Memperbarui data akun staf ${data.name || id}`);
    addToast('success', 'Data staf berhasil diperbarui.');
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    apiService.deleteUser(id).catch(() => {});
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
    apiService.createWithdrawal(newRecord).catch(() => {});
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
    apiService.updateWithdrawalStatus(id, status).catch(() => {});
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
    setFormulaConfig(DEFAULT_FORMULA_CONFIG);
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
        formulaConfig,
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
        updateFormulaConfig,
        resetFormulaConfigToDefault,
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
