export type CustomerStatus = 'Aktif' | 'Tidak Aktif' | 'Suspended' | 'Prospek';

export interface Customer {
  id: string; // e.g. CUS-2026-00001
  fullName: string;
  nik: string;
  companyName: string;
  npwp: string;
  nib: string;
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
  | 'users'
  | 'audit-log';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}
