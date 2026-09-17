import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import {
  DollarSign,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  FileText,
  Wallet,
  Target,
  Receipt,
  Activity,
} from 'lucide-react';

interface DashboardViewProps {
  onAddCustomerClick?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = () => {
  const {
    customers,
    services,
    quotations,
    withdrawals,
  } = useApp();

  // Active services with pricing allocation
  const activeServices = useMemo(() => {
    return services.filter((s) => s.status === 'Aktif');
  }, [services]);

  // Total Sales Metrics
  const totalSalesRevenue = useMemo(() => {
    // Total DPP (Nilai Penjualan Layanan Bersih sebelum PPN)
    return activeServices.reduce((acc, s) => acc + (s.dpp || 0), 0);
  }, [activeServices]);

  // Total Fee Allocations from Marketing Pool
  const feeMetrics = useMemo(() => {
    let totalMarketingPool = 0;
    let totalSalesFee = 0;
    let totalAmFee = 0;

    activeServices.forEach((s) => {
      const a = s.pricingAllocation;
      if (a) {
        totalMarketingPool += a.marketingPool?.amount || 0;
        totalSalesFee += a.sales?.amount || 0;
        totalAmFee += a.am?.amount || 0;
      }
    });

    // Withdrawals for Sales
    const paidSalesWithdrawals = withdrawals
      .filter((w) => w.status === 'Paid' && w.recipientRole === 'Sales')
      .reduce((acc, w) => acc + w.amount, 0);

    const pendingSalesWithdrawals = withdrawals
      .filter((w) => w.status === 'Pending' && w.recipientRole === 'Sales')
      .reduce((acc, w) => acc + w.amount, 0);

    // Available Sales Balance
    const availableSalesFee = Math.max(
      0,
      totalSalesFee - (paidSalesWithdrawals + pendingSalesWithdrawals)
    );

    return {
      totalMarketingPool,
      totalSalesFee,
      totalAmFee,
      paidSalesWithdrawals,
      pendingSalesWithdrawals,
      availableSalesFee,
    };
  }, [activeServices, withdrawals]);

  // Quotation Pipeline
  const acceptedQuotations = quotations.filter((q) => q.status === 'Accepted');
  const pipelineQuotations = quotations.filter(
    (q) => q.status === 'Draft' || q.status === 'Sent'
  );
  const winRate =
    quotations.length > 0
      ? Math.round((acceptedQuotations.length / quotations.length) * 100)
      : 0;

  // Sales Representatives Performance Leaderboard
  const salesTeam = [
    {
      id: 'SLS-001',
      name: 'Rian Pratama',
      role: 'Senior Account Executive / Sales',
      dealsCount: activeServices.length,
      totalSalesAmount: totalSalesRevenue,
      earnedFee: feeMetrics.totalSalesFee,
      availableFee: feeMetrics.availableSalesFee,
      achievementRate: 108,
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      badge: 'Top Performer',
    },
    {
      id: 'SLS-002',
      name: 'Budi Santoso',
      role: 'Account Manager & Sales Partner',
      dealsCount: 2,
      totalSalesAmount: 56812500,
      earnedFee: feeMetrics.totalAmFee,
      availableFee: Math.max(0, feeMetrics.totalAmFee - 300000),
      achievementRate: 95,
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      badge: 'AM Partner',
    },
    {
      id: 'SLS-003',
      name: 'Siti Aminah',
      role: 'Junior Sales Representative',
      dealsCount: 1,
      totalSalesAmount: 20000000,
      earnedFee: 750000,
      availableFee: 750000,
      achievementRate: 85,
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      badge: 'Rising Star',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Dashboard
        </h1>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Penjualan Sales */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Penjualan Sales
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                {formatRupiah(totalSalesRevenue)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-teal-700 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{activeServices.length} Layanan Deal Terjual</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Fee Komisi Sales */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Komisi Sales
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold font-mono text-amber-700 tracking-tight">
                {formatRupiah(feeMetrics.totalSalesFee)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>75% dari Pool Marketing</span>
            </div>
          </div>
        </div>

        {/* Card 3: Saldo Komisi Belum Dicairkan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Saldo Komisi Tersedia
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold font-mono text-emerald-700 tracking-tight">
                {formatRupiah(feeMetrics.availableSalesFee)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Dalam Proses: {formatRupiah(feeMetrics.pendingSalesWithdrawals)}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Deals & Win Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Pipeline & Deals
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{acceptedQuotations.length} Deal</span>
              <span className="text-xs text-slate-400">/ {quotations.length} penawaran</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{winRate}% Closing ({pipelineQuotations.length} Prospek Aktif)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Team Performance Leaderboard */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-bold text-slate-900">Performa Tim Sales</h3>
        </div>

        {/* Sales Rep Cards in responsive 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {salesTeam.map((rep) => (
            <div
              key={rep.id}
              className="p-3.5 rounded-lg bg-slate-50/60 hover:bg-slate-50 border border-slate-200/80 transition-all flex flex-col justify-between gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={rep.avatar}
                    alt={rep.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-semibold text-slate-900 text-xs truncate">{rep.name}</p>
                      <span className="text-[9px] font-medium px-1.5 py-0.2 bg-white text-slate-700 border border-slate-200 rounded">
                        {rep.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{rep.role}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] text-slate-400 block">{rep.dealsCount} Closing</span>
                  <span className="text-xs font-bold text-emerald-600 font-mono">
                    {rep.achievementRate}% Target
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 text-[11px]">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Penjualan</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {formatRupiah(rep.totalSalesAmount)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Komisi Sales</span>
                  <span className="font-semibold text-amber-700 font-mono">
                    {formatRupiah(rep.earnedFee)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row: Recent Deals Pipeline & Fee Withdrawal Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Sales Deals & Pipeline */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">Pipeline Penawaran & Closing</h3>
          </div>

          <div className="space-y-2">
            {quotations.slice(0, 4).map((q) => {
              const customer = customers.find((c) => c.id === q.customerId);
              const estFeeSales = q.pricingAllocation?.sales?.amount || Math.round(q.dpp * 0.05);

              const getStatusBadge = (status: string) => {
                switch (status) {
                  case 'Accepted':
                    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  case 'Sent':
                    return 'bg-blue-50 text-blue-700 border-blue-200';
                  case 'Draft':
                    return 'bg-slate-100 text-slate-700 border-slate-200';
                  default:
                    return 'bg-amber-50 text-amber-700 border-amber-200';
                }
              };

              return (
                <div
                  key={q.id}
                  className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 truncate">
                        {customer?.companyName || 'Prospek Klien'}
                      </span>
                      <span
                        className={`text-[9px] font-medium px-1.5 py-0.2 rounded border ${getStatusBadge(
                          q.status
                        )}`}
                      >
                        {q.status === 'Accepted' ? 'Deal' : q.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {q.bandwidthMbps} Mbps • {q.id}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-semibold text-slate-900 font-mono block">
                      {formatRupiah(q.dpp)}
                    </span>
                    <span className="text-[10px] text-amber-700 font-medium">
                      Fee: {formatRupiah(estFeeSales)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Fee Withdrawals & Payouts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Receipt className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">Riwayat Pencairan Komisi</h3>
          </div>

          <div className="space-y-2">
            {withdrawals.slice(0, 4).map((w) => {
              const isPaid = w.status === 'Paid';

              return (
                <div
                  key={w.id}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {isPaid ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-800 truncate">{w.recipientName}</p>
                        <span className="text-[9px] px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded font-semibold">
                          {w.recipientRole}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {w.notes || 'Pengajuan fee closing'} • {w.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-bold text-slate-900 font-mono text-sm block">
                      {formatRupiah(w.amount)}
                    </span>
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.2 rounded-full border mt-0.5 ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {isPaid ? '✓ Telah Ditransfer' : 'Menunggu Verifikasi'}
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
