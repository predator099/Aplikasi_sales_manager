export type CustomerStatus = 'Aktif' | 'Tidak Aktif' | 'Suspended' | 'Prospek';

export interface DocumentAttachment {
  name: string;
  size?: number; // bytes
  type?: string; // e.g. 'application/pdf' or 'image/png'
  fileData?: string; // base64 or blob URL
  uploadedAt: string;
}

export interface Customer {
  id: string; // e.g. CUS-2026-00001
  fullName: string;
  nik: string;
  companyName: string;
  npwp: string; // Nomor NPWP
  nib: string; // Nomor NIB
  npwpDocument?: DocumentAttachment | null; // Lampiran Dokumen NPWP
  nibDocument?: DocumentAttachment | null; // Lampiran Dokumen NIB
  picPosition: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  status: CustomerStatus;
  notes?: string;
  createdAt: string;

  // Additional Sales, Technical, Finance & Contract Info
  salesName?: string; // Nama Sales
  salesPhone?: string; // Nomor Telpon Sales
  picTechnicalPhone?: string; // Nomor PIC Teknis
  picFinanceName?: string; // Nama PIC Keuangan
  picFinancePhone?: string; // Nomor PIC Keuangan
  subscriptionPeriod?: string; // Jangka Waktu Berlangganan (e.g. '12 Bulan (1 Tahun)', '24 Bulan', '6 Bulan')
  responsiblePerson?: string; // Penanggung Jawab
  responsiblePersonPhone?: string; // Nomor Penanggung Jawab
}

export type MetroPriceMethod = 'Per Mbps' | 'Per Gbps' | 'Per 100 Mbps';

export interface Metro {
  id: string;
  name: string;
  bandwidthMbps?: number; // Optional specific bandwidth capacity
  priceMethod: MetroPriceMethod;
  price: number;
  status: 'Aktif' | 'Tidak Aktif';
  notes?: string;
}

export interface PublicIp {
  id: string;
  prefix: string; // e.g. 'Tanpa Public IP', '/32', '/30', '/29', etc.
  price: number;
  status: 'Aktif' | 'Tidak Aktif';
}

export interface BandwidthTier {
  id: string; // e.g. 'tier-100', 'tier-200', 'tier-1000'
  bandwidthMbps: number; // e.g. 100, 200, 300, 500, 1000 (1 Gbps), 2000 (2 Gbps)
  name: string; // e.g. 'Paket Internet 100 Mbps', 'Paket Internet 1 Gbps'
  price: number; // e.g. 3000000, 5500000, 20000000
  notes?: string;
  isActive: boolean;
}

export interface PricingConfig {
  internetPricePer100Mbps: number; // standard fallback rate per 100 Mbps
  ppnPercentage: number; // e.g. 11
  minBandwidthMbps: number; // 100
  maxBandwidthMbps: number; // 20000 (20 Gbps)
  bandwidthStepMbps: number; // 100
  bandwidthTiers: BandwidthTier[]; // Custom pricing defined per specific bandwidth
}

export interface PricingAllocationItem {
  amount: number;
  percentage: number;
}

export interface PricingAllocation {
  bottomPrice: number;
  sellingPrice: number;
  margin: number;
  kantor: PricingAllocationItem;
  marketingPool: PricingAllocationItem;
  sales: PricingAllocationItem;
  am: PricingAllocationItem;
}

export type MetroFormulaMethod =
  | 'proportional_capacity' // (Bandwidth / Metro Base Capacity) * Harga Metro
  | 'per_mbps'              // Bandwidth * Harga Metro
  | 'per_gbps'              // (Bandwidth / 1000) * Harga Metro
  | 'per_100mbps'           // (Bandwidth / 100) * Harga Metro
  | 'flat_port';            // Flat rate per port terlepas dari bandwidth

export type MetroRoundingRule = 'none' | 'round_thousand' | 'round_hundred_thousand';

export interface CalculationFormulaConfig {
  id: string;
  updatedAt: string;
  updatedBy: string;

  // Rumus Internet Dedicated
  internetCalculationMethod: 'tier_priority_fallback' | 'pure_per_mbps';
  internetFallbackPer100Mbps: number; // default 3000000
  internetFallbackPerMbps: number;    // default 30000
  ppnPercentage: number;              // default 11
  maxDiscountPercentage: number;      // default 50

  // Rumus Metro Ethernet
  metroCalculationMethod: MetroFormulaMethod;
  metroMultiplierRatio: number;       // default 1.0 (misal 1.25 untuk link redundansi)
  metroRoundingRule: MetroRoundingRule;
  metroMinimumPrice: number;          // tarif minimum metro per bulan

  // Rumus Fee Sales & Marketing Allocation
  kantorPercentage: number;           // default 60 (%)
  marketingPoolPercentage: number;    // default 40 (%)
  salesPercentageOfPool: number;      // default 75 (%)
  amPercentageOfPool: number;         // default 25 (%)
  minimumMarginForFee: number;        // default 0 (margin minimum agar komisi cair)
  enableSalesBonus: boolean;          // default false
  bonusThresholdMargin: number;       // default 5000000
  salesBonusPercentage: number;       // default 5 (%)
}

export interface FeeWithdrawalRecord {
  id: string;
  serviceId?: string;
  customerName?: string;
  recipientName: string;
  recipientRole: 'Sales' | 'AM' | 'Marketing';
  amount: number;
  date: string;
  status: 'Pending' | 'Paid';
  paymentDate?: string;
  notes?: string;
}

export interface ServiceItem {
  id: string; // e.g. SRV-2026-00001
  customerId: string;
  bandwidthMbps: number;
  metroId: string;
  publicIpId: string;
  discountType: 'nominal' | 'percentage';
  discountValue: number;
  notes?: string;
  internetCost: number;
  metroCost: number;
  publicIpCost: number;
  subtotal: number;
  discountAmount: number;
  dpp: number;
  ppnAmount: number;
  totalMonthly: number;
  pricingAllocation?: PricingAllocation;
  status: 'Aktif' | 'Nonaktif' | 'Suspended';
  createdAt: string;
}

export type QuotationStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired';

export interface Quotation {
  id: string; // e.g. QT-2026-00001
  date: string;
  customerId: string;
  serviceId?: string;
  bandwidthMbps: number;
  metroId: string;
  publicIpId: string;
  internetCost: number;
  metroCost: number;
  publicIpCost: number;
  subtotal: number;
  discountType: 'nominal' | 'percentage';
  discountValue: number;
  discountAmount: number;
  dpp: number;
  ppnAmount: number;
  total: number;
  pricingAllocation?: PricingAllocation;
  status: QuotationStatus;
  notes?: string;
  validUntil: string;
  createdAt: string;
}

export type InvoicePaymentStatus = 'Draft' | 'Unpaid' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled';

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  paymentMethod: string; // 'Transfer Bank BCA' | 'Mandiri' | 'Virtual Account' | 'Cash'
  referenceNumber: string;
  notes?: string;
  createdAt: string;
}

export interface Invoice {
  id: string; // e.g. INV-2026-00001
  customerId: string;
  serviceId?: string;
  quotationId?: string;
  serviceDescription: string;
  billingPeriod: string; // e.g. "Oktober 2026"
  issueDate: string;
  dueDate: string;
  subtotal: number;
  discountAmount: number;
  dpp: number;
  ppnAmount: number;
  total: number;
  paidAmount: number;
  paymentStatus: InvoicePaymentStatus;
  payments: PaymentRecord[];
  notes?: string;
  createdAt: string;
}

export type UserRole =
  | 'Super Admin'
  | 'Finance'
  | 'Sales'
  | 'AM'
  | 'NOC / Teknis'
  | 'Administrator'
  | 'Accounting'
  | 'Manager';

export interface SystemUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  status: 'Aktif' | 'Tidak Aktif' | 'Nonaktif';
  password?: string;
}

export type User = SystemUser;

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userName: string;
  role: UserRole;
  userRole: UserRole;
  action: string;
  module: string;
  recordId?: string;
  description?: string;
  details: string;
  ipAddress?: string;
}

export type ActiveMenu =
  | 'dashboard'
  | 'customers'
  | 'master-pricing'
  | 'master-metro'
  | 'master-ip'
  | 'metro'
  | 'public-ip'
  | 'create-service'
  | 'quotations'
  | 'invoices'
  | 'marketing-fee'
  | 'formula-settings'
  | 'users'
  | 'audit-log';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}
