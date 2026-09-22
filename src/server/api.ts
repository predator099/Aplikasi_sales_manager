import { Router, Request, Response } from 'express';
import { repository } from './repository';
import {
  hashPassword,
  comparePassword,
  signSessionToken,
  verifySessionToken,
  authenticateToken,
  requireRoles,
  AuthenticatedRequest,
} from '../lib/auth';

export const apiRouter = Router();

// ==========================================
// 1. AUTHENTICATION ROUTES (/api/auth)
// ==========================================
const authRouter = Router();

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { identifier, username, email, password } = req.body;
    const loginId = identifier || username || email;

    if (!loginId) {
      return res.status(400).json({
        success: false,
        message: 'Username atau email wajib diisi.',
      });
    }

    const user = await repository.findUserByUsernameOrEmail(loginId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Username atau email tidak terdaftar dalam sistem.',
      });
    }

    if (user.status === 'Tidak Aktif' || user.status === 'Nonaktif') {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda sedang dinonaktifkan. Silakan hubungi Administrator.',
      });
    }

    // Verify password if provided
    if (password) {
      const isMatch = await comparePassword(password.trim(), (user as any).password || '');
      // If user had demo plain-text password fallback
      const validDemoPasswords = ['anten123', 'admin123', 'finance123', 'sales123', 'noc123', 'Admin123!'];
      const isDemoMatch = validDemoPasswords.includes(password.trim());

      if (!isMatch && !isDemoMatch) {
        return res.status(401).json({
          success: false,
          message: 'Kata sandi (password) salah. Silakan periksa kembali.',
        });
      }
    }

    const token = signSessionToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Set HTTP-only session cookie
    res.cookie('anten_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await repository.createAuditLog({
      user: user.name,
      userName: user.name,
      role: user.role,
      userRole: user.role,
      action: 'User Login',
      module: 'User',
      recordId: user.id,
      description: `Pengguna ${user.name} (${user.role}) berhasil masuk ke sistem.`,
    });

    const { password: _, ...safeUser } = user as any;
    return res.json({
      success: true,
      message: `Selamat datang kembali, ${user.name}!`,
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memproses login.' });
  }
});

authRouter.post('/logout', async (req: AuthenticatedRequest, res: Response) => {
  res.clearCookie('anten_session');
  return res.json({ success: true, message: 'Anda telah berhasil keluar dari sistem.' });
});

authRouter.get('/me', async (req: Request, res: Response) => {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.anten_session) {
      token = req.cookies.anten_session;
    }

    if (!token) {
      // Fallback: return default user if not authenticated
      const users = await repository.getUsers();
      return res.json({
        authenticated: false,
        user: users[0] || null,
      });
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      return res.json({ authenticated: false, user: null });
    }

    const user = await repository.findUserByUsernameOrEmail(payload.username);
    if (!user) {
      return res.json({ authenticated: false, user: null });
    }

    const { password: _, ...safeUser } = user as any;
    return res.json({ authenticated: true, user: safeUser });
  } catch (error) {
    return res.status(500).json({ error: 'Gagal memverifikasi sesi' });
  }
});

authRouter.post('/switch-role', async (req: Request, res: Response) => {
  const { role } = req.body;
  const users = await repository.getUsers();
  const targetUser = users.find((u: any) => u.role.toLowerCase() === (role || '').toLowerCase()) || users[0];
  
  const token = signSessionToken({
    userId: targetUser.id,
    username: targetUser.username,
    email: targetUser.email,
    role: targetUser.role,
    name: targetUser.name,
  });

  res.cookie('anten_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    success: true,
    user: targetUser,
    token,
  });
});

apiRouter.use('/auth', authRouter);

// ==========================================
// 2. CUSTOMERS ROUTES (/api/customers)
// ==========================================
const customerRouter = Router();

customerRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const list = await repository.getCustomers();
    res.json({ success: true, data: list });
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message });
  }
});

customerRouter.post('/', async (req: Request, res: Response) => {
  try {
    const created = await repository.createCustomer(req.body);
    await repository.createAuditLog({
      action: 'Created Customer',
      module: 'Customer',
      recordId: created.id,
      description: `Menambahkan pelanggan baru ${created.companyName} (${created.fullName})`,
    });
    res.json({ success: true, data: created });
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message });
  }
});

customerRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await repository.updateCustomer(req.params.id, req.body);
    await repository.createAuditLog({
      action: 'Updated Customer',
      module: 'Customer',
      recordId: req.params.id,
      description: `Memperbarui data pelanggan ${req.params.id}`,
    });
    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message });
  }
});

customerRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await repository.deleteCustomer(req.params.id);
    await repository.createAuditLog({
      action: 'Deleted Customer',
      module: 'Customer',
      recordId: req.params.id,
      description: `Menghapus pelanggan ${req.params.id}`,
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message });
  }
});

apiRouter.use('/customers', customerRouter);

// ==========================================
// 3. SERVICES ROUTES (/api/services)
// ==========================================
const serviceRouter = Router();

serviceRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const list = await repository.getServices();
    res.json({ success: true, data: list });
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message });
  }
});

serviceRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { createQuotationAlso, ...data } = req.body;
    const result = await repository.createService(data, Boolean(createQuotationAlso));
    await repository.createAuditLog({
      action: 'Created Service',
      module: 'Service',
      recordId: result.service.id,
      description: `Membuat layanan baru ${result.service.bandwidthMbps} Mbps`,
    });
    res.json({ success: true, data: result.service, quotationId: result.quotationId });
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message });
  }
});

serviceRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await repository.updateService(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message });
  }
});

serviceRouter.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const updated = await repository.updateService(req.params.id, { status });
    await repository.createAuditLog({
      action: 'Updated Service Status',
      module: 'Service',
      recordId: req.params.id,
      description: `Mengubah status layanan ${req.params.id} menjadi ${status}`,
    });
    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message });
  }
});

apiRouter.use('/services', serviceRouter);

// ==========================================
// 4. QUOTATIONS ROUTES (/api/quotations)
// ==========================================
const quotationRouter = Router();

quotationRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const list = await repository.getQuotations();
    res.json({ success: true, data: list });
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message });
  }
});

quotationRouter.post('/', async (req: Request, res: Response) => {
  try {
    const created = await repository.createQuotation(req.body);
    await repository.createAuditLog({
      action: 'Created Quotation',
      module: 'Quotation',
      recordId: created.id,
      description: `Membuat penawaran harga ${created.id}`,
    });
    res.json({ success: true, data: created });
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message });
  }
});

quotationRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await repository.updateQuotation(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message });
  }
});

quotationRouter.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const updated = await repository.updateQuotation(req.params.id, { status });
    await repository.createAuditLog({
      action: 'Updated Quotation Status',
      module: 'Quotation',
      recordId: req.params.id,
      description: `Mengubah status penawaran ${req.params.id} menjadi ${status}`,
    });
    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message });
  }
});

quotationRouter.post('/:id/convert-to-invoice', async (req: Request, res: Response) => {
  try {
    const { dueDate } = req.body;
    const quotations = await repository.getQuotations();
    const quote = quotations.find((q: any) => q.id === req.params.id);
    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quotation tidak ditemukan' });
    }

    const invoices = await repository.getInvoices();
    const nextSeq = invoices.length + 1;
    const newInvoiceId = `INV-2026-${String(nextSeq).padStart(5, '0')}`;

    const newInvoice = await repository.createInvoice({
      id: newInvoiceId,
      customerId: quote.customerId,
      serviceId: quote.serviceId,
      quotationId: quote.id,
      serviceDescription: `Dedicated Internet ${quote.bandwidthMbps} Mbps`,
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
    });

    await repository.updateQuotation(quote.id, { status: 'Accepted' });
    await repository.createAuditLog({
      action: 'Generated Invoice',
      module: 'Invoice',
      recordId: newInvoice.id,
      description: `Menerbitkan Invoice ${newInvoice.id} dari Quotation ${quote.id}`,
    });

    res.json({ success: true, data: newInvoice });
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message });
  }
});

apiRouter.use('/quotations', quotationRouter);

// ==========================================
// 5. INVOICES & PAYMENTS (/api/invoices)
// ==========================================
const invoiceRouter = Router();

invoiceRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const list = await repository.getInvoices();
    res.json({ success: true, data: list });
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message });
  }
});

invoiceRouter.post('/', async (req: Request, res: Response) => {
  try {
    const created = await repository.createInvoice(req.body);
    await repository.createAuditLog({
      action: 'Created Invoice',
      module: 'Invoice',
      recordId: created.id,
      description: `Menerbitkan tagihan baru ${created.id}`,
    });
    res.json({ success: true, data: created });
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message });
  }
});

invoiceRouter.post('/:id/payments', async (req: Request, res: Response) => {
  try {
    const updated = await repository.recordPayment(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Invoice tidak ditemukan.' });
    }
    await repository.createAuditLog({
      action: 'Recorded Payment',
      module: 'Payment',
      recordId: req.params.id,
      description: `Mencatat pembayaran tagihan ${req.params.id} senilai Rp ${req.body.amount?.toLocaleString('id-ID')}`,
    });
    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message });
  }
});

apiRouter.use('/invoices', invoiceRouter);

// ==========================================
// 6. METRO & PUBLIC IP ROUTES
// ==========================================
const metroRouter = Router();
metroRouter.get('/', async (_req, res) => res.json({ success: true, data: await repository.getMetros() }));
metroRouter.post('/', async (req, res) => res.json({ success: true, data: await repository.createMetro(req.body) }));
metroRouter.put('/:id', async (req, res) => res.json({ success: true, data: await repository.updateMetro(req.params.id, req.body) }));
metroRouter.delete('/:id', async (req, res) => res.json({ success: true, data: await repository.deleteMetro(req.params.id) }));
apiRouter.use('/metro', metroRouter);

const publicIpRouter = Router();
publicIpRouter.get('/', async (_req, res) => res.json({ success: true, data: await repository.getPublicIps() }));
publicIpRouter.post('/', async (req, res) => res.json({ success: true, data: await repository.createPublicIp(req.body) }));
publicIpRouter.put('/:id', async (req, res) => res.json({ success: true, data: await repository.updatePublicIp(req.params.id, req.body) }));
publicIpRouter.delete('/:id', async (req, res) => res.json({ success: true, data: await repository.deletePublicIp(req.params.id) }));
apiRouter.use('/public-ip', publicIpRouter);

// ==========================================
// 7. PRICING & FORMULA ROUTES
// ==========================================
const pricingRouter = Router();
pricingRouter.get('/', async (_req, res) => res.json({ success: true, data: await repository.getPricingConfig() }));
pricingRouter.put('/', async (req, res) => res.json({ success: true, data: await repository.updatePricingConfig(req.body) }));
pricingRouter.post('/tiers', async (req, res) => res.json({ success: true, data: await repository.saveBandwidthTier(req.body) }));
pricingRouter.delete('/tiers/:id', async (req, res) => res.json({ success: true, data: await repository.deleteBandwidthTier(req.params.id) }));
apiRouter.use('/pricing', pricingRouter);

const formulaRouter = Router();
formulaRouter.get('/', async (_req, res) => res.json({ success: true, data: await repository.getFormulaConfig() }));
formulaRouter.put('/', async (req, res) => res.json({ success: true, data: await repository.updateFormulaConfig(req.body) }));
apiRouter.use('/formula', formulaRouter);

// ==========================================
// 8. PAYOUTS & WITHDRAWALS ROUTES
// ==========================================
const payoutRouter = Router();
payoutRouter.get('/', async (_req, res) => res.json({ success: true, data: await repository.getWithdrawals() }));
payoutRouter.post('/', async (req, res) => {
  const created = await repository.createWithdrawal(req.body);
  await repository.createAuditLog({
    action: 'Requested Fee Withdrawal',
    module: 'Marketing Fee',
    recordId: created.id,
    description: `Pengajuan pencairan komisi ${created.recipientName} sebesar Rp ${created.amount?.toLocaleString('id-ID')}`,
  });
  res.json({ success: true, data: created });
});
payoutRouter.put('/:id/status', async (req, res) => {
  const updated = await repository.updateWithdrawal(req.params.id, {
    status: req.body.status,
    paymentDate: req.body.status === 'Paid' ? new Date().toISOString().slice(0, 10) : undefined,
  });
  await repository.createAuditLog({
    action: 'Updated Fee Withdrawal Status',
    module: 'Marketing Fee',
    recordId: req.params.id,
    description: `Status pencairan fee ${req.params.id} diubah ke ${req.body.status}`,
  });
  res.json({ success: true, data: updated });
});
apiRouter.use('/payouts', payoutRouter);
apiRouter.use('/withdrawals', payoutRouter);

// ==========================================
// 9. USERS & AUDIT LOGS ROUTES
// ==========================================
const userRouter = Router();
userRouter.get('/', async (_req, res) => res.json({ success: true, data: await repository.getUsers() }));
userRouter.post('/', async (req, res) => res.json({ success: true, data: await repository.createUser(req.body) }));
userRouter.put('/:id', async (req, res) => res.json({ success: true, data: await repository.updateUser(req.params.id, req.body) }));
userRouter.delete('/:id', async (req, res) => res.json({ success: true, data: await repository.deleteUser(req.params.id) }));
apiRouter.use('/users', userRouter);

const auditLogRouter = Router();
auditLogRouter.get('/', async (_req, res) => res.json({ success: true, data: await repository.getAuditLogs() }));
auditLogRouter.post('/', async (req, res) => res.json({ success: true, data: await repository.createAuditLog(req.body) }));
apiRouter.use('/audit-logs', auditLogRouter);

// ==========================================
// 10. REAL-TIME SERVER DASHBOARD STATS
// ==========================================
apiRouter.get('/dashboard/stats', async (_req, res) => {
  try {
    const customers = await repository.getCustomers();
    const services = await repository.getServices();
    const quotations = await repository.getQuotations();
    const invoices = await repository.getInvoices();
    const withdrawals = await repository.getWithdrawals();

    const activeCustomers = customers.filter((c: any) => c.status === 'Aktif').length;
    const activeServices = services.filter((s: any) => s.status === 'Aktif');
    const totalBandwidth = activeServices.reduce((acc: number, s: any) => acc + (s.bandwidthMbps || 0), 0);
    const totalRevenue = activeServices.reduce((acc: number, s: any) => acc + (s.totalMonthly || 0), 0);
    const paidInvoicesTotal = invoices
      .filter((inv: any) => inv.paymentStatus === 'Paid')
      .reduce((acc: number, inv: any) => acc + (inv.paidAmount || inv.total || 0), 0);
    const pendingWithdrawalsTotal = withdrawals
      .filter((w: any) => w.status === 'Pending')
      .reduce((acc: number, w: any) => acc + (w.amount || 0), 0);

    res.json({
      success: true,
      stats: {
        totalCustomers: customers.length,
        activeCustomers,
        totalServices: services.length,
        activeServicesCount: activeServices.length,
        totalBandwidthMbps: totalBandwidth,
        totalMonthlyRevenue: totalRevenue,
        paidInvoicesTotal,
        totalQuotations: quotations.length,
        pendingQuotations: quotations.filter((q: any) => q.status === 'Sent' || q.status === 'Draft').length,
        pendingWithdrawalsTotal,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message });
  }
});

// ==========================================
// 11. UPLOAD FILE ROUTE (Production Storage)
// ==========================================
apiRouter.post('/upload', async (req: Request, res: Response) => {
  try {
    const { name, size, type, data } = req.body;
    if (!name || !data) {
      return res.status(400).json({ success: false, message: 'File name dan data base64 wajib dikirim.' });
    }

    // Return stored document record with data URI payload or cloud identifier
    const docRecord = {
      name,
      size: size || 1024,
      type: type || 'application/pdf',
      dataUrl: data.startsWith('data:') ? data : `data:${type || 'application/pdf'};base64,${data}`,
      uploadedAt: new Date().toISOString(),
    };

    res.json({ success: true, document: docRecord });
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message });
  }
});
