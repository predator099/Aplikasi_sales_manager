import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  DEFAULT_FORMULA_CONFIG,
  INITIAL_PRICING,
  INITIAL_METRO,
  INITIAL_PUBLIC_IPS,
  INITIAL_CUSTOMERS,
  INITIAL_SERVICES,
  INITIAL_QUOTATIONS,
  INITIAL_INVOICES,
  INITIAL_USERS,
  INITIAL_WITHDRAWAL_RECORDS,
  INITIAL_AUDIT_LOGS,
} from '../src/data/initialData';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for ANTEN ISP Business Manager...');

  // 1. Seed Pricing Config
  await prisma.pricingConfig.upsert({
    where: { id: 'BASE-PRICING' },
    update: {
      internetPricePer100Mbps: INITIAL_PRICING.internetPricePer100Mbps,
      ppnPercentage: INITIAL_PRICING.ppnPercentage,
      minBandwidthMbps: INITIAL_PRICING.minBandwidthMbps,
      maxBandwidthMbps: INITIAL_PRICING.maxBandwidthMbps,
      bandwidthStepMbps: INITIAL_PRICING.bandwidthStepMbps,
    },
    create: {
      id: 'BASE-PRICING',
      internetPricePer100Mbps: INITIAL_PRICING.internetPricePer100Mbps,
      ppnPercentage: INITIAL_PRICING.ppnPercentage,
      minBandwidthMbps: INITIAL_PRICING.minBandwidthMbps,
      maxBandwidthMbps: INITIAL_PRICING.maxBandwidthMbps,
      bandwidthStepMbps: INITIAL_PRICING.bandwidthStepMbps,
    },
  });
  console.log('✓ Pricing config seeded');

  // 2. Seed Bandwidth Tiers
  for (const tier of INITIAL_PRICING.bandwidthTiers) {
    await prisma.bandwidthTier.upsert({
      where: { bandwidthMbps: tier.bandwidthMbps },
      update: {
        id: tier.id,
        name: tier.name,
        price: tier.price,
        notes: tier.notes,
        isActive: tier.isActive ?? true,
      },
      create: {
        id: tier.id,
        bandwidthMbps: tier.bandwidthMbps,
        name: tier.name,
        price: tier.price,
        notes: tier.notes,
        isActive: tier.isActive ?? true,
      },
    });
  }
  console.log(`✓ ${INITIAL_PRICING.bandwidthTiers.length} Bandwidth tiers seeded`);

  // 3. Seed Formula Config
  await prisma.calculationFormulaConfig.upsert({
    where: { id: DEFAULT_FORMULA_CONFIG.id || 'FORMULA-DEFAULT-v1' },
    update: {
      internetCalculationMethod: DEFAULT_FORMULA_CONFIG.internetCalculationMethod,
      internetFallbackPer100Mbps: DEFAULT_FORMULA_CONFIG.internetFallbackPer100Mbps,
      internetFallbackPerMbps: DEFAULT_FORMULA_CONFIG.internetFallbackPerMbps,
      ppnPercentage: DEFAULT_FORMULA_CONFIG.ppnPercentage,
      maxDiscountPercentage: DEFAULT_FORMULA_CONFIG.maxDiscountPercentage,
      metroCalculationMethod: DEFAULT_FORMULA_CONFIG.metroCalculationMethod,
      metroMultiplierRatio: DEFAULT_FORMULA_CONFIG.metroMultiplierRatio,
      metroRoundingRule: DEFAULT_FORMULA_CONFIG.metroRoundingRule,
      metroMinimumPrice: DEFAULT_FORMULA_CONFIG.metroMinimumPrice,
      kantorPercentage: DEFAULT_FORMULA_CONFIG.kantorPercentage,
      marketingPoolPercentage: DEFAULT_FORMULA_CONFIG.marketingPoolPercentage,
      salesPercentageOfPool: DEFAULT_FORMULA_CONFIG.salesPercentageOfPool,
      amPercentageOfPool: DEFAULT_FORMULA_CONFIG.amPercentageOfPool,
      minimumMarginForFee: DEFAULT_FORMULA_CONFIG.minimumMarginForFee,
      enableSalesBonus: DEFAULT_FORMULA_CONFIG.enableSalesBonus,
      bonusThresholdMargin: DEFAULT_FORMULA_CONFIG.bonusThresholdMargin,
      salesBonusPercentage: DEFAULT_FORMULA_CONFIG.salesBonusPercentage,
      userFeeRates: DEFAULT_FORMULA_CONFIG.userFeeRates as any,
      updatedBy: DEFAULT_FORMULA_CONFIG.updatedBy,
    },
    create: {
      id: DEFAULT_FORMULA_CONFIG.id || 'FORMULA-DEFAULT-v1',
      internetCalculationMethod: DEFAULT_FORMULA_CONFIG.internetCalculationMethod,
      internetFallbackPer100Mbps: DEFAULT_FORMULA_CONFIG.internetFallbackPer100Mbps,
      internetFallbackPerMbps: DEFAULT_FORMULA_CONFIG.internetFallbackPerMbps,
      ppnPercentage: DEFAULT_FORMULA_CONFIG.ppnPercentage,
      maxDiscountPercentage: DEFAULT_FORMULA_CONFIG.maxDiscountPercentage,
      metroCalculationMethod: DEFAULT_FORMULA_CONFIG.metroCalculationMethod,
      metroMultiplierRatio: DEFAULT_FORMULA_CONFIG.metroMultiplierRatio,
      metroRoundingRule: DEFAULT_FORMULA_CONFIG.metroRoundingRule,
      metroMinimumPrice: DEFAULT_FORMULA_CONFIG.metroMinimumPrice,
      kantorPercentage: DEFAULT_FORMULA_CONFIG.kantorPercentage,
      marketingPoolPercentage: DEFAULT_FORMULA_CONFIG.marketingPoolPercentage,
      salesPercentageOfPool: DEFAULT_FORMULA_CONFIG.salesPercentageOfPool,
      amPercentageOfPool: DEFAULT_FORMULA_CONFIG.amPercentageOfPool,
      minimumMarginForFee: DEFAULT_FORMULA_CONFIG.minimumMarginForFee,
      enableSalesBonus: DEFAULT_FORMULA_CONFIG.enableSalesBonus,
      bonusThresholdMargin: DEFAULT_FORMULA_CONFIG.bonusThresholdMargin,
      salesBonusPercentage: DEFAULT_FORMULA_CONFIG.salesBonusPercentage,
      userFeeRates: DEFAULT_FORMULA_CONFIG.userFeeRates as any,
      updatedBy: DEFAULT_FORMULA_CONFIG.updatedBy,
    },
  });
  console.log('✓ Formula config seeded');

  // 4. Seed Metros
  for (const m of INITIAL_METRO) {
    await prisma.metro.upsert({
      where: { id: m.id },
      update: {
        name: m.name,
        bandwidthMbps: m.bandwidthMbps,
        priceMethod: m.priceMethod,
        price: m.price,
        status: m.status,
        notes: m.notes,
      },
      create: {
        id: m.id,
        name: m.name,
        bandwidthMbps: m.bandwidthMbps,
        priceMethod: m.priceMethod,
        price: m.price,
        status: m.status,
        notes: m.notes,
      },
    });
  }
  console.log(`✓ ${INITIAL_METRO.length} Metro providers seeded`);

  // 5. Seed Public IPs
  for (const ip of INITIAL_PUBLIC_IPS) {
    await prisma.publicIp.upsert({
      where: { id: ip.id },
      update: {
        prefix: ip.prefix,
        price: ip.price,
        status: ip.status,
      },
      create: {
        id: ip.id,
        prefix: ip.prefix,
        price: ip.price,
        status: ip.status,
      },
    });
  }
  console.log(`✓ ${INITIAL_PUBLIC_IPS.length} Public IPs seeded`);

  // 6. Seed Users with Bcrypt Hashing
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@anten.net.id';
  const adminPass = process.env.ADMIN_PASSWORD || 'Admin123!';
  const defaultSalt = await bcrypt.genSalt(10);
  const adminHashed = await bcrypt.hash(adminPass, defaultSalt);

  for (const u of INITIAL_USERS) {
    const isMainAdmin = u.username === 'admin' || u.email === adminEmail;
    const rawPass = isMainAdmin ? adminPass : (u.password || 'anten123');
    const hashedPassword = await bcrypt.hash(rawPass, defaultSalt);

    await prisma.user.upsert({
      where: { email: isMainAdmin ? adminEmail : u.email },
      update: {
        name: u.name,
        username: u.username,
        role: u.role,
        avatarUrl: u.avatarUrl,
        status: u.status,
        password: hashedPassword,
      },
      create: {
        id: u.id,
        name: u.name,
        username: u.username,
        email: isMainAdmin ? adminEmail : u.email,
        password: hashedPassword,
        role: u.role,
        avatarUrl: u.avatarUrl,
        status: u.status,
      },
    });
  }
  console.log(`✓ ${INITIAL_USERS.length} System Users seeded with secure hashed passwords`);

  // 7. Seed Customers
  for (const c of INITIAL_CUSTOMERS) {
    await prisma.customer.upsert({
      where: { id: c.id },
      update: {
        fullName: c.fullName,
        nik: c.nik,
        companyName: c.companyName,
        npwp: c.npwp,
        nib: c.nib,
        npwpDocument: c.npwpDocument as any,
        nibDocument: c.nibDocument as any,
        picPosition: c.picPosition,
        whatsapp: c.whatsapp,
        email: c.email,
        address: c.address,
        city: c.city,
        province: c.province,
        postalCode: c.postalCode,
        status: c.status,
        notes: c.notes,
        salesName: c.salesName,
        salesPhone: c.salesPhone,
        picTechnicalPhone: c.picTechnicalPhone,
        picFinanceName: c.picFinanceName,
        picFinancePhone: c.picFinancePhone,
        subscriptionPeriod: c.subscriptionPeriod,
        responsiblePerson: c.responsiblePerson,
        responsiblePersonPhone: c.responsiblePersonPhone,
      },
      create: {
        id: c.id,
        fullName: c.fullName,
        nik: c.nik,
        companyName: c.companyName,
        npwp: c.npwp,
        nib: c.nib,
        npwpDocument: c.npwpDocument as any,
        nibDocument: c.nibDocument as any,
        picPosition: c.picPosition,
        whatsapp: c.whatsapp,
        email: c.email,
        address: c.address,
        city: c.city,
        province: c.province,
        postalCode: c.postalCode,
        status: c.status,
        notes: c.notes,
        salesName: c.salesName,
        salesPhone: c.salesPhone,
        picTechnicalPhone: c.picTechnicalPhone,
        picFinanceName: c.picFinanceName,
        picFinancePhone: c.picFinancePhone,
        subscriptionPeriod: c.subscriptionPeriod,
        responsiblePerson: c.responsiblePerson,
        responsiblePersonPhone: c.responsiblePersonPhone,
      },
    });
  }
  console.log(`✓ ${INITIAL_CUSTOMERS.length} Customers seeded`);

  // 8. Seed Services
  for (const s of INITIAL_SERVICES) {
    await prisma.serviceItem.upsert({
      where: { id: s.id },
      update: {
        customerId: s.customerId,
        bandwidthMbps: s.bandwidthMbps,
        metroId: s.metroId,
        publicIpId: s.publicIpId,
        discountType: s.discountType,
        discountValue: s.discountValue,
        notes: s.notes,
        internetCost: s.internetCost,
        metroCost: s.metroCost,
        publicIpCost: s.publicIpCost,
        subtotal: s.subtotal,
        discountAmount: s.discountAmount,
        dpp: s.dpp,
        ppnAmount: s.ppnAmount,
        totalMonthly: s.totalMonthly,
        pricingAllocation: s.pricingAllocation as any,
        status: s.status,
      },
      create: {
        id: s.id,
        customerId: s.customerId,
        bandwidthMbps: s.bandwidthMbps,
        metroId: s.metroId,
        publicIpId: s.publicIpId,
        discountType: s.discountType,
        discountValue: s.discountValue,
        notes: s.notes,
        internetCost: s.internetCost,
        metroCost: s.metroCost,
        publicIpCost: s.publicIpCost,
        subtotal: s.subtotal,
        discountAmount: s.discountAmount,
        dpp: s.dpp,
        ppnAmount: s.ppnAmount,
        totalMonthly: s.totalMonthly,
        pricingAllocation: s.pricingAllocation as any,
        status: s.status,
      },
    });
  }
  console.log(`✓ ${INITIAL_SERVICES.length} Services seeded`);

  // 9. Seed Quotations
  for (const q of INITIAL_QUOTATIONS) {
    await prisma.quotation.upsert({
      where: { id: q.id },
      update: {
        date: q.date,
        customerId: q.customerId,
        serviceId: q.serviceId,
        bandwidthMbps: q.bandwidthMbps,
        metroId: q.metroId,
        publicIpId: q.publicIpId,
        internetCost: q.internetCost,
        metroCost: q.metroCost,
        publicIpCost: q.publicIpCost,
        subtotal: q.subtotal,
        discountType: q.discountType,
        discountValue: q.discountValue,
        discountAmount: q.discountAmount,
        dpp: q.dpp,
        ppnAmount: q.ppnAmount,
        total: q.total,
        pricingAllocation: q.pricingAllocation as any,
        status: q.status,
        notes: q.notes,
        validUntil: q.validUntil,
      },
      create: {
        id: q.id,
        date: q.date,
        customerId: q.customerId,
        serviceId: q.serviceId,
        bandwidthMbps: q.bandwidthMbps,
        metroId: q.metroId,
        publicIpId: q.publicIpId,
        internetCost: q.internetCost,
        metroCost: q.metroCost,
        publicIpCost: q.publicIpCost,
        subtotal: q.subtotal,
        discountType: q.discountType,
        discountValue: q.discountValue,
        discountAmount: q.discountAmount,
        dpp: q.dpp,
        ppnAmount: q.ppnAmount,
        total: q.total,
        pricingAllocation: q.pricingAllocation as any,
        status: q.status,
        notes: q.notes,
        validUntil: q.validUntil,
      },
    });
  }
  console.log(`✓ ${INITIAL_QUOTATIONS.length} Quotations seeded`);

  // 10. Seed Invoices & Payments
  for (const inv of INITIAL_INVOICES) {
    await prisma.invoice.upsert({
      where: { id: inv.id },
      update: {
        customerId: inv.customerId,
        serviceId: inv.serviceId,
        serviceDescription: inv.serviceDescription,
        billingPeriod: inv.billingPeriod,
        issueDate: inv.issueDate,
        dueDate: inv.dueDate,
        subtotal: inv.subtotal,
        discountAmount: inv.discountAmount,
        dpp: inv.dpp,
        ppnAmount: inv.ppnAmount,
        total: inv.total,
        paidAmount: inv.paidAmount,
        paymentStatus: inv.paymentStatus,
        notes: inv.notes,
      },
      create: {
        id: inv.id,
        customerId: inv.customerId,
        serviceId: inv.serviceId,
        serviceDescription: inv.serviceDescription,
        billingPeriod: inv.billingPeriod,
        issueDate: inv.issueDate,
        dueDate: inv.dueDate,
        subtotal: inv.subtotal,
        discountAmount: inv.discountAmount,
        dpp: inv.dpp,
        ppnAmount: inv.ppnAmount,
        total: inv.total,
        paidAmount: inv.paidAmount,
        paymentStatus: inv.paymentStatus,
        notes: inv.notes,
      },
    });

    if (inv.payments && inv.payments.length > 0) {
      for (const p of inv.payments) {
        await prisma.paymentRecord.upsert({
          where: { id: p.id },
          update: {
            date: p.date,
            amount: p.amount,
            paymentMethod: p.paymentMethod,
            referenceNumber: p.referenceNumber,
            notes: p.notes,
          },
          create: {
            id: p.id,
            invoiceId: inv.id,
            date: p.date,
            amount: p.amount,
            paymentMethod: p.paymentMethod,
            referenceNumber: p.referenceNumber,
            notes: p.notes,
          },
        });
      }
    }
  }
  console.log(`✓ ${INITIAL_INVOICES.length} Invoices & Payments seeded`);

  // 11. Seed Fee Withdrawals
  for (const w of INITIAL_WITHDRAWAL_RECORDS) {
    await prisma.feeWithdrawalRecord.upsert({
      where: { id: w.id },
      update: {
        serviceId: w.serviceId,
        customerName: w.customerName,
        recipientName: w.recipientName,
        recipientRole: w.recipientRole,
        amount: w.amount,
        date: w.date,
        status: w.status,
        paymentDate: w.paymentDate,
        notes: w.notes,
      },
      create: {
        id: w.id,
        serviceId: w.serviceId,
        customerName: w.customerName,
        recipientName: w.recipientName,
        recipientRole: w.recipientRole,
        amount: w.amount,
        date: w.date,
        status: w.status,
        paymentDate: w.paymentDate,
        notes: w.notes,
      },
    });
  }
  console.log(`✓ ${INITIAL_WITHDRAWAL_RECORDS.length} Fee Withdrawal records seeded`);

  // 12. Seed Audit Logs
  for (const l of INITIAL_AUDIT_LOGS) {
    await prisma.auditLog.upsert({
      where: { id: l.id },
      update: {
        user: l.user,
        userName: l.userName,
        role: l.role,
        userRole: l.userRole,
        action: l.action,
        module: l.module,
        recordId: l.recordId,
        description: l.description,
        details: l.details,
        ipAddress: l.ipAddress,
      },
      create: {
        id: l.id,
        user: l.user,
        userName: l.userName,
        role: l.role,
        userRole: l.userRole,
        action: l.action,
        module: l.module,
        recordId: l.recordId,
        description: l.description,
        details: l.details,
        ipAddress: l.ipAddress,
      },
    });
  }
  console.log(`✓ ${INITIAL_AUDIT_LOGS.length} Audit logs seeded`);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
