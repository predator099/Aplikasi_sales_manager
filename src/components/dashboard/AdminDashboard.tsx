import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatDate } from '../../utils/formatters';
import {
  TrendingUp,
  Users,
  Wallet,
  Receipt,
  FileText,
  Shield,
  Briefcase,
  UserPlus,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    customers,
    services,
    quotations,
    invoices,
    users,
    auditLogs,
    withdrawals,
    formulaConfig,
    setActiveMenu,
  } = useApp();

  // Layanan aktif
  const activeServices = useMemo(() => {
    return services.filter((s) => s.status === 'Aktif');
  }, [services]);

  // Total pendapatan bulanan (DPP)
  const totalMonthlyRevenue = useMemo(() => {
    return activeServices.reduce((acc, s) => acc + (s.dpp || 0), 0);
  }, [activeServices]);

  // Status pelanggan
  const activeCustomersCount = customers.filter((c) => c.status === 'Aktif').length;
  const prospectCustomersCount = customers.filter((c) => c.status === 'Prospek').length;

  // Faktur & piutang
  const unpaidInvoices = invoices.filter(
    (inv) => inv.paymentStatus === 'Unpaid' || inv.paymentStatus === 'Overdue'
  );
  const unpaidTotalAmount = unpaidInvoices.reduce((acc, inv) => acc + (inv.total - inv.paidAmount), 0);
  const paidInvoicesCount = invoices.filter((inv) => inv.paymentStatus === 'Paid').length;

  // Metrik fee & pool
  const feeMetrics = useMemo(() => {
    let totalMarketingPool = 0;
    activeServices.forEach((s) => {
      const a = s.pricingAllocation;
      if (a) {
        totalMarketingPool += a.marketingPool?.amount || 0;
      }
    });
    return { totalMarketingPool };
  }, [activeServices]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
            Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setActiveMenu('users')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-500" />
            <span>Kelola Pengguna</span>
          </button>
          <button
            onClick={() => setActiveMenu('create-service')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Buat Layanan</span>
          </button>
        </div>
      </div>

      {/* 4 Kartu Metrik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pendapatan */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Pendapatan Bulanan (DPP)
            </span>
            <TrendingUp className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {formatRupiah(totalMonthlyRevenue)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {activeServices.length} layanan aktif terpasang
          </p>
        </div>

        {/* Database Pelanggan */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Total Pelanggan
            </span>
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {customers.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {activeCustomersCount} Aktif • {prospectCustomersCount} Prospek
          </p>
        </div>

        {/* Piutang / Tagihan */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Tagihan Belum Lunas
            </span>
            <Receipt className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-700">
            {formatRupiah(unpaidTotalAmount)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {unpaidInvoices.length} faktur • {paidInvoicesCount} lunas
          </p>
        </div>

        {/* Pool Marketing & Fee */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Marketing Pool
            </span>
            <Wallet className="w-4 h-4 text-indigo-700" />
          </div>
          <div className="text-xl font-bold font-mono text-indigo-700">
            {formatRupiah(feeMetrics.totalMarketingPool)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Alokasi {formulaConfig.marketingPoolPercentage}% margin
          </p>
        </div>
      </div>

      {/* Grid 2 Kolom: Penagihan & Log Aktivitas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Status Faktur Terkini */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-slate-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Faktur & Penagihan Terkini
              </h3>
            </div>
            <button
              onClick={() => setActiveMenu('invoices')}
              className="text-xs text-teal-800 hover:text-teal-900 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              Lihat Faktur <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {invoices.slice(0, 4).map((inv) => {
              const customer = customers.find((c) => c.id === inv.customerId);
              const isPaid = inv.paymentStatus === 'Paid';
              const isOverdue = inv.paymentStatus === 'Overdue';
              return (
                <div
                  key={inv.id}
                  className="p-3 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {customer?.companyName || 'Pelanggan'}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {inv.id} • Tempo: {formatDate(inv.dueDate)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-semibold text-slate-900 font-mono block">
                      {formatRupiah(inv.total)}
                    </span>
                    <span
                      className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded border mt-0.5 ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isOverdue
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {inv.paymentStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Log Aktivitas Audit Terkini */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Log Aktivitas Sistem
              </h3>
            </div>
            <button
              onClick={() => setActiveMenu('audit-log')}
              className="text-xs text-teal-800 hover:text-teal-900 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              Semua Log <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLogs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="p-3 hover:bg-slate-50/60 transition-colors flex items-start justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate">
                    {log.action}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Oleh <span className="font-medium text-slate-600">{log.userName}</span> ({log.userRole})
                  </p>
                </div>
                <div className="text-right shrink-0 text-[11px] text-slate-400 font-mono">
                  {log.timestamp.includes('T') ? log.timestamp.split('T')[0] : log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Bawah: Pengguna Tim & Penawaran */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Tim Pengguna */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Pengguna & Peran Aktif
              </h3>
            </div>
            <button
              onClick={() => setActiveMenu('users')}
              className="text-xs text-teal-800 hover:text-teal-900 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              Kelola <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {users.slice(0, 4).map((u) => (
              <div
                key={u.id}
                className="p-3 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                    {u.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{u.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">{u.email}</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded border bg-slate-50 text-slate-700 border-slate-200">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Penawaran Terkini */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Penawaran Masuk
              </h3>
            </div>
            <button
              onClick={() => setActiveMenu('quotations')}
              className="text-xs text-teal-800 hover:text-teal-900 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              Semua Penawaran <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {quotations.slice(0, 4).map((q) => {
              const customer = customers.find((c) => c.id === q.customerId);
              return (
                <div
                  key={q.id}
                  className="p-3 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {customer?.companyName || 'Calon Klien'}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {q.id} • {q.bandwidthMbps} Mbps
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-semibold text-slate-900 font-mono block">
                      {formatRupiah(q.dpp)}
                    </span>
                    <span className="inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded border bg-slate-50 text-slate-600 border-slate-200 mt-0.5">
                      {q.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
