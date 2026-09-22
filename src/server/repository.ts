import { prisma } from '../lib/db';
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
import { hashPassword, comparePassword } from '../lib/auth';

let dbAvailable: boolean | null = null;

async function checkDb(): Promise<boolean> {
  if (dbAvailable !== null) return dbAvailable;
  if (!process.env.DATABASE_URL) {
    dbAvailable = false;
    return false;
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbAvailable = true;
    return true;
  } catch (e) {
    console.warn('PostgreSQL database not reachable, running with in-memory persistence fallback:', (e as Error).message);
    dbAvailable = false;
    return false;
  }
}

// In-memory data store for fallback when database is not yet provisioned in preview
const memoryStore = {
  users: [...INITIAL_USERS],
  customers: [...INITIAL_CUSTOMERS],
  metros: [...INITIAL_METRO],
  publicIps: [...INITIAL_PUBLIC_IPS],
  pricing: { ...INITIAL_PRICING },
  formula: { ...DEFAULT_FORMULA_CONFIG },
  services: [...INITIAL_SERVICES],
  quotations: [...INITIAL_QUOTATIONS],
  invoices: [...INITIAL_INVOICES],
  withdrawals: [...INITIAL_WITHDRAWAL_RECORDS],
  auditLogs: [...INITIAL_AUDIT_LOGS],
};

export const repository = {
  // USERS
  async getUsers() {
    const isDb = await checkDb();
    if (isDb) {
      try {
        const users = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
            avatarUrl: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        });
        return users;
      } catch (e) {
        console.error('Prisma getUsers error, fallback to memory', e);
      }
    }
    return memoryStore.users.map(({ password, ...u }) => u);
  },

  async findUserByUsernameOrEmail(identifier: string) {
    const isDb = await checkDb();
    const clean = identifier.trim().toLowerCase();
    if (isDb) {
      try {
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: { equals: clean, mode: 'insensitive' } },
              { email: { equals: clean, mode: 'insensitive' } },
            ],
          },
        });
        if (user) return user;
      } catch (e) {
        console.error('Prisma findUser error, fallback to memory', e);
      }
    }
    return memoryStore.users.find(
      (u) =>
        u.username.toLowerCase() === clean || u.email.toLowerCase() === clean
    ) || null;
  },

  async createUser(data: any) {
    const isDb = await checkDb();
    const hashedPassword = await hashPassword(data.password || 'anten123');
    const id = data.id || `USR-${String(memoryStore.users.length + 1).padStart(3, '0')}`;
    
    if (isDb) {
      try {
        const created = await prisma.user.create({
          data: {
            id,
            name: data.name,
            username: data.username,
            email: data.email,
            password: hashedPassword,
            role: data.role || 'Sales',
            avatarUrl: data.avatarUrl || null,
            status: data.status || 'Aktif',
          },
        });
        const { password, ...safe } = created;
        return safe;
      } catch (e) {
        console.error('Prisma createUser error, fallback to memory', e);
      }
    }
    
    const newUser = {
      id,
      name: data.name,
      username: data.username,
      email: data.email,
      password: hashedPassword,
      role: data.role || 'Sales',
      avatarUrl: data.avatarUrl,
      status: data.status || 'Aktif',
    };
    memoryStore.users.push(newUser);
    const { password, ...safe } = newUser;
    return safe;
  },

  async updateUser(id: string, data: any) {
    const isDb = await checkDb();
    let updatePayload: any = { ...data };
    if (data.password) {
      updatePayload.password = await hashPassword(data.password);
    }
    if (isDb) {
      try {
        const updated = await prisma.user.update({
          where: { id },
          data: updatePayload,
        });
        const { password, ...safe } = updated;
        return safe;
      } catch (e) {
        console.error('Prisma updateUser error, fallback to memory', e);
      }
    }
    const idx = memoryStore.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      memoryStore.users[idx] = { ...memoryStore.users[idx], ...updatePayload };
      const { password, ...safe } = memoryStore.users[idx];
      return safe;
    }
    return null;
  },

  async deleteUser(id: string) {
    const isDb = await checkDb();
    if (isDb) {
      try {
        await prisma.user.delete({ where: { id } });
        return true;
      } catch (e) {
        console.error('Prisma deleteUser error, fallback to memory', e);
      }
    }
    memoryStore.users = memoryStore.users.filter((u) => u.id !== id);
    return true;
  },

  // CUSTOMERS
  async getCustomers() {
    const isDb = await checkDb();
    if (isDb) {
      try {
        const list = await prisma.customer.findMany({
          orderBy: { createdAt: 'desc' },
        });
        return list;
      } catch (e) {
        console.error('Prisma getCustomers error, fallback to memory', e);
      }
    }
    return memoryStore.customers;
  },

  async createCustomer(data: any) {
    const isDb = await checkDb();
    const nextSeq = memoryStore.customers.length + 1;
    const id = data.id || `CUS-2026-${String(nextSeq).padStart(5, '0')}`;
    const newCustomer = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    if (isDb) {
      try {
        const created = await prisma.customer.create({
          data: {
            ...newCustomer,
            npwpDocument: newCustomer.npwpDocument || undefined,
            nibDocument: newCustomer.nibDocument || undefined,
          },
        });
        return created;
      } catch (e) {
        console.error('Prisma createCustomer error, fallback to memory', e);
      }
    }
    memoryStore.customers.unshift(newCustomer);
    return newCustomer;
  },

  async updateCustomer(id: string, data: any) {
    const isDb = await checkDb();
    if (isDb) {
      try {
        const updated = await prisma.customer.update({
          where: { id },
          data,
        });
        return updated;
      } catch (e) {
        console.error('Prisma updateCustomer error, fallback to memory', e);
      }
    }
    const idx = memoryStore.customers.findIndex((c) => c.id === id);
    if (idx !== -1) {
      memoryStore.customers[idx] = { ...memoryStore.customers[idx], ...data };
      return memoryStore.customers[idx];
    }
    return null;
  },

  async deleteCustomer(id: string) {
    const isDb = await checkDb();
    if (isDb) {
      try {
        await prisma.customer.delete({ where: { id } });
        return true;
      } catch (e) {
        console.error('Prisma deleteCustomer error, fallback to memory', e);
      }
    }
    memoryStore.customers = memoryStore.customers.filter((c) => c.id !== id);
    return true;
  },

  // SERVICES
  async getServices() {
    const isDb = await checkDb();
    if (isDb) {
      try {
        const list = await prisma.serviceItem.findMany({
          orderBy: { createdAt: 'desc' },
        });
        return list;
      } catch (e) {
        console.error('Prisma getServices error, fallback to memory', e);
      }
    }
    return memoryStore.services;
  },

  async createService(data: any, createQuotationAlso = false) {
    const isDb = await checkDb();
    const nextSeq = memoryStore.services.length + 1;
    const id = data.id || `SRV-2026-${String(nextSeq).padStart(5, '0')}`;
    const newService = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };

    let quotationId: string | undefined = undefined;
    if (createQuotationAlso) {
      const qSeq = memoryStore.quotations.length + 1;
      quotationId = `QT-2026-${String(qSeq).padStart(5, '0')}`;
      const newQuotation = {
        id: quotationId,
        date: new Date().toISOString().slice(0, 10),
        customerId: data.customerId,
        serviceId: id,
        bandwidthMbps: data.bandwidthMbps,
        metroId: data.metroId,
        publicIpId: data.publicIpId,
        internetCost: data.internetCost,
        metroCost: data.metroCost,
        publicIpCost: data.publicIpCost,
        subtotal: data.subtotal,
        discountType: data.discountType,
        discountValue: data.discountValue,
        discountAmount: data.discountAmount,
        dpp: data.dpp,
        ppnAmount: data.ppnAmount,
        total: data.totalMonthly,
        pricingAllocation: data.pricingAllocation,
        status: 'Draft' as const,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        notes: data.notes,
        createdAt: new Date().toISOString(),
      };
      memoryStore.quotations.unshift(newQuotation);
      if (isDb) {
        try {
          await prisma.quotation.create({
            data: newQuotation as any,
          });
        } catch (e) {
          console.error('Error creating auto-quotation in prisma', e);
        }
      }
    }

    if (isDb) {
      try {
        const created = await prisma.serviceItem.create({
          data: newService,
        });
        return { service: created, quotationId };
      } catch (e) {
        console.error('Prisma createService error, fallback to memory', e);
      }
    }

    memoryStore.services.unshift(newService);
    return { service: newService, quotationId };
  },

  async updateService(id: string, data: any) {
    const isDb = await checkDb();
    if (isDb) {
      try {
        const updated = await prisma.serviceItem.update({
          where: { id },
          data,
        });
        return updated;
      } catch (e) {
        console.error('Prisma updateService error, fallback to memory', e);
      }
    }
    const idx = memoryStore.services.findIndex((s) => s.id === id);
    if (idx !== -1) {
      memoryStore.services[idx] = { ...memoryStore.services[idx], ...data };
      return memoryStore.services[idx];
    }
    return null;
  },

  // QUOTATIONS
  async getQuotations() {
    const isDb = await checkDb();
    if (isDb) {
      try {
        const list = await prisma.quotation.findMany({
          orderBy: { createdAt: 'desc' },
        });
        return list;
      } catch (e) {
        console.error('Prisma getQuotations error, fallback to memory', e);
      }
    }
    return memoryStore.quotations;
  },

  async createQuotation(data: any) {
    const isDb = await checkDb();
    const nextSeq = memoryStore.quotations.length + 1;
    const id = data.id || `QT-2026-${String(nextSeq).padStart(5, '0')}`;
    const newQuote = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    if (isDb) {
      try {
        const created = await prisma.quotation.create({
          data: newQuote,
        });
        return created;
      } catch (e) {
        console.error('Prisma createQuotation error, fallback to memory', e);
      }
    }
    memoryStore.quotations.unshift(newQuote);
    return newQuote;
  },

  async updateQuotation(id: string, data: any) {
    const isDb = await checkDb();
    if (isDb) {
      try {
        const updated = await prisma.quotation.update({
          where: { id },
          data,
        });
        return updated;
      } catch (e) {
        console.error('Prisma updateQuotation error, fallback to memory', e);
      }
    }
    const idx = memoryStore.quotations.findIndex((q) => q.id === id);
    if (idx !== -1) {
      memoryStore.quotations[idx] = { ...memoryStore.quotations[idx], ...data };
      return memoryStore.quotations[idx];
    }
    return null;
  },

  // INVOICES & PAYMENTS
  async getInvoices() {
    const isDb = await checkDb();
    if (isDb) {
      try {
        const list = await prisma.invoice.findMany({
          include: { payments: true },
          orderBy: { createdAt: 'desc' },
        });
        return list;
      } catch (e) {
        console.error('Prisma getInvoices error, fallback to memory', e);
      }
    }
    return memoryStore.invoices;
  },

  async createInvoice(data: any) {
    const isDb = await checkDb();
    const nextSeq = memoryStore.invoices.length + 1;
    const id = data.id || `INV-2026-${String(nextSeq).padStart(5, '0')}`;
    const newInvoice = {
      ...data,
      id,
      paidAmount: data.paidAmount || 0,
      paymentStatus: data.paymentStatus || 'Unpaid',
      payments: data.payments || [],
      createdAt: new Date().toISOString(),
    };
    if (isDb) {
      try {
        const { payments, ...invData } = newInvoice;
        const created = await prisma.invoice.create({
          data: invData,
        });
        return created;
      } catch (e) {
        console.error('Prisma createInvoice error, fallback to memory', e);
      }
    }
    memoryStore.invoices.unshift(newInvoice);
    return newInvoice;
  },

  async recordPayment(invoiceId: string, paymentData: any) {
    const isDb = await checkDb();
    const paymentId = paymentData.id || `PAY-${Date.now().toString().slice(-6)}`;
    const newPayment = {
      ...paymentData,
      id: paymentId,
      invoiceId,
      createdAt: new Date().toISOString(),
    };

    if (isDb) {
      try {
        await prisma.paymentRecord.create({
          data: newPayment,
        });
        const currentInv = await prisma.invoice.findUnique({ where: { id: invoiceId } });
        if (currentInv) {
          const newPaid = currentInv.paidAmount + paymentData.amount;
          const newStatus = newPaid >= currentInv.total ? 'Paid' : newPaid > 0 ? 'Partially Paid' : currentInv.paymentStatus;
          const updated = await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
              paidAmount: newPaid,
              paymentStatus: newStatus,
            },
            include: { payments: true },
          });
          return updated;
        }
      } catch (e) {
        console.error('Prisma recordPayment error, fallback to memory', e);
      }
    }

    const idx = memoryStore.invoices.findIndex((inv) => inv.id === invoiceId);
    if (idx !== -1) {
      const inv = memoryStore.invoices[idx];
      const newPaid = inv.paidAmount + paymentData.amount;
      const newStatus = newPaid >= inv.total ? 'Paid' : newPaid > 0 ? 'Partially Paid' : inv.paymentStatus;
      inv.paidAmount = newPaid;
      inv.paymentStatus = newStatus;
      inv.payments = [...(inv.payments || []), newPayment];
      return inv;
    }
    return null;
  },

  // METRO & PUBLIC IP
  async getMetros() {
    const isDb = await checkDb();
    if (isDb) {
      try {
        return await prisma.metro.findMany({ orderBy: { id: 'asc' } });
      } catch (e) {
        console.error(e);
      }
    }
    return memoryStore.metros;
  },

  async createMetro(data: any) {
    const isDb = await checkDb();
    const id = data.id || `MTR-${String(memoryStore.metros.length + 1).padStart(3, '0')}`;
    const newMtr = { ...data, id };
    if (isDb) {
      try {
        return await prisma.metro.create({ data: newMtr });
      } catch (e) {
        console.error(e);
      }
    }
    memoryStore.metros.push(newMtr);
    return newMtr;
  },

  async updateMetro(id: string, data: any) {
    const isDb = await checkDb();
    if (isDb) {
      try {
        return await prisma.metro.update({ where: { id }, data });
      } catch (e) {
        console.error(e);
      }
    }
    const idx = memoryStore.metros.findIndex((m) => m.id === id);
    if (idx !== -1) {
      memoryStore.metros[idx] = { ...memoryStore.metros[idx], ...data };
      return memoryStore.metros[idx];
    }
    return null;
  },

  async deleteMetro(id: string) {
    const isDb = await checkDb();
    if (isDb) {
      try {
        await prisma.metro.delete({ where: { id } });
        return true;
      } catch (e) {
        console.error(e);
      }
    }
    memoryStore.metros = memoryStore.metros.filter((m) => m.id !== id);
    return true;
  },

  async getPublicIps() {
    const isDb = await checkDb();
    if (isDb) {
      try {
        return await prisma.publicIp.findMany({ orderBy: { id: 'asc' } });
      } catch (e) {
        console.error(e);
      }
    }
    return memoryStore.publicIps;
  },

  async createPublicIp(data: any) {
    const isDb = await checkDb();
    const id = data.id || `PIP-${String(memoryStore.publicIps.length + 1).padStart(3, '0')}`;
    const newIp = { ...data, id };
    if (isDb) {
      try {
        return await prisma.publicIp.create({ data: newIp });
      } catch (e) {
        console.error(e);
      }
    }
    memoryStore.publicIps.push(newIp);
    return newIp;
  },

  async updatePublicIp(id: string, data: any) {
    const isDb = await checkDb();
    if (isDb) {
      try {
        return await prisma.publicIp.update({ where: { id }, data });
      } catch (e) {
        console.error(e);
      }
    }
    const idx = memoryStore.publicIps.findIndex((p) => p.id === id);
    if (idx !== -1) {
      memoryStore.publicIps[idx] = { ...memoryStore.publicIps[idx], ...data };
      return memoryStore.publicIps[idx];
    }
    return null;
  },

  async deletePublicIp(id: string) {
    const isDb = await checkDb();
    if (isDb) {
      try {
        await prisma.publicIp.delete({ where: { id } });
        return true;
      } catch (e) {
        console.error(e);
      }
    }
    memoryStore.publicIps = memoryStore.publicIps.filter((p) => p.id !== id);
    return true;
  },

  // PRICING & FORMULA
  async getPricingConfig() {
    const isDb = await checkDb();
    if (isDb) {
      try {
        const config = await prisma.pricingConfig.findFirst();
        const tiers = await prisma.bandwidthTier.findMany({ orderBy: { bandwidthMbps: 'asc' } });
        if (config) {
          return {
            ...config,
            bandwidthTiers: tiers,
          };
        }
      } catch (e) {
        console.error(e);
      }
    }
    return memoryStore.pricing;
  },

  async updatePricingConfig(data: any) {
    const isDb = await checkDb();
    if (isDb) {
      try {
        const updated = await prisma.pricingConfig.upsert({
          where: { id: 'BASE-PRICING' },
          update: data,
          create: { id: 'BASE-PRICING', ...data },
        });
        return updated;
      } catch (e) {
        console.error(e);
      }
    }
    memoryStore.pricing = { ...memoryStore.pricing, ...data };
    return memoryStore.pricing;
  },

  async saveBandwidthTier(tierData: any) {
    const isDb = await checkDb();
    if (isDb) {
      try {
        return await prisma.bandwidthTier.upsert({
          where: { bandwidthMbps: tierData.bandwidthMbps },
          update: tierData,
          create: tierData,
        });
      } catch (e) {
        console.error(e);
      }
    }
    const idx = memoryStore.pricing.bandwidthTiers.findIndex((t) => t.id === tierData.id || t.bandwidthMbps === tierData.bandwidthMbps);
    if (idx !== -1) {
      memoryStore.pricing.bandwidthTiers[idx] = tierData;
    } else {
      memoryStore.pricing.bandwidthTiers.push(tierData);
    }
    memoryStore.pricing.bandwidthTiers.sort((a, b) => a.bandwidthMbps - b.bandwidthMbps);
    return tierData;
  },

  async deleteBandwidthTier(tierId: string) {
    const isDb = await checkDb();
    if (isDb) {
      try {
        await prisma.bandwidthTier.delete({ where: { id: tierId } });
        return true;
      } catch (e) {
        console.error(e);
      }
    }
    memoryStore.pricing.bandwidthTiers = memoryStore.pricing.bandwidthTiers.filter((t) => t.id !== tierId);
    return true;
  },

  async getFormulaConfig() {
    const isDb = await checkDb();
    if (isDb) {
      try {
        const found = await prisma.calculationFormulaConfig.findFirst();
        if (found) return found;
      } catch (e) {
        console.error(e);
      }
    }
    return memoryStore.formula;
  },

  async updateFormulaConfig(data: any) {
    const isDb = await checkDb();
    if (isDb) {
      try {
        return await prisma.calculationFormulaConfig.upsert({
          where: { id: DEFAULT_FORMULA_CONFIG.id || 'FORMULA-DEFAULT-v1' },
          update: data,
          create: { id: DEFAULT_FORMULA_CONFIG.id || 'FORMULA-DEFAULT-v1', ...data },
        });
      } catch (e) {
        console.error(e);
      }
    }
    memoryStore.formula = { ...memoryStore.formula, ...data, updatedAt: new Date().toISOString() };
    return memoryStore.formula;
  },

  // WITHDRAWALS / PAYOUTS
  async getWithdrawals() {
    const isDb = await checkDb();
    if (isDb) {
      try {
        return await prisma.feeWithdrawalRecord.findMany({ orderBy: { createdAt: 'desc' } });
      } catch (e) {
        console.error(e);
      }
    }
    return memoryStore.withdrawals;
  },

  async createWithdrawal(data: any) {
    const isDb = await checkDb();
    const id = data.id || `WDR-2026-${String(memoryStore.withdrawals.length + 1).padStart(3, '0')}`;
    const newRecord = { ...data, id };
    if (isDb) {
      try {
        return await prisma.feeWithdrawalRecord.create({ data: newRecord });
      } catch (e) {
        console.error(e);
      }
    }
    memoryStore.withdrawals.unshift(newRecord);
    return newRecord;
  },

  async updateWithdrawal(id: string, data: any) {
    const isDb = await checkDb();
    if (isDb) {
      try {
        return await prisma.feeWithdrawalRecord.update({ where: { id }, data });
      } catch (e) {
        console.error(e);
      }
    }
    const idx = memoryStore.withdrawals.findIndex((w) => w.id === id);
    if (idx !== -1) {
      memoryStore.withdrawals[idx] = { ...memoryStore.withdrawals[idx], ...data };
      return memoryStore.withdrawals[idx];
    }
    return null;
  },

  // AUDIT LOGS
  async getAuditLogs() {
    const isDb = await checkDb();
    if (isDb) {
      try {
        return await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
      } catch (e) {
        console.error(e);
      }
    }
    return memoryStore.auditLogs;
  },

  async createAuditLog(data: any) {
    const isDb = await checkDb();
    const id = data.id || `LOG-${Date.now()}`;
    const newLog = {
      ...data,
      id,
      timestamp: data.timestamp || new Date().toISOString(),
      details: data.details || data.description || '',
    };
    if (isDb) {
      try {
        return await prisma.auditLog.create({
          data: {
            id,
            user: newLog.user || newLog.userName || 'System',
            userName: newLog.userName || newLog.user || 'System',
            role: newLog.role || newLog.userRole || 'Sales',
            userRole: newLog.userRole || newLog.role || 'Sales',
            action: newLog.action || 'Action',
            module: newLog.module || 'System',
            recordId: newLog.recordId || null,
            description: newLog.description || null,
            details: newLog.details || '',
            ipAddress: newLog.ipAddress || null,
          },
        });
      } catch (e) {
        console.error(e);
      }
    }
    memoryStore.auditLogs.unshift(newLog);
    return newLog;
  },
};
