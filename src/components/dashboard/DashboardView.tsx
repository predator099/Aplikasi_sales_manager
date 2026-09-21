import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import {
  TrendingUp,
  Clock,
  FileText,
  Wallet,
  Users,
  Briefcase,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    customers,
    services,
    quotations,
    withdrawals,
    formulaConfig,
    setActiveMenu,
  } = useApp();

  // Layanan aktif
  const activeServices = useMemo(() => {
    return services.filter((s) => s.status === 'Aktif');
  }, [services]);

  // Total pendapatan bulanan (DPP)
  const totalSalesRevenue = useMemo(() => {
    return activeServices.reduce((acc, s) => acc + (s.dpp || 0), 0);
  }, [activeServices]);

  // Metrik fee & komisi
  const feeMetrics = useMemo(() => {
    let totalMarketingPool = 0;
    let totalSalesFee = 0;

    activeServices.forEach((s) => {
      const a = s.pricingAllocation;
      if (a) {
        totalMarketingPool += a.marketingPool?.amount || 0;
        totalSalesFee += a.sales?.amount || 0;
      }
    });

    const paidSalesWithdrawals = withdrawals
      .filter((w) => w.status === 'Paid' && w.recipientRole === 'Sales')
      .reduce((acc, w) => acc + w.amount, 0);

    const pendingSalesWithdrawals = withdrawals
      .filter((w) => w.status === 'Pending' && w.recipientRole === 'Sales')
      .reduce((acc, w) => acc + w.amount, 0);

    const availableSalesFee = Math.max(
      0,
      totalSalesFee - (paidSalesWithdrawals + pendingSalesWithdrawals)
    );

    return {
      totalMarketingPool,
      totalSalesFee,
      availableSalesFee,
      pendingSalesWithdrawals,
    };
  }, [activeServices, withdrawals]);

  // Penawaran
  const acceptedQuotations = quotations.filter((q) => q.status === 'Accepted');

  return (
    <div className="space-y-6">
      {/* Header Bersih & Ringkas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
            Dashboard
          </h1>
        </div>

        <button
          onClick={() => setActiveMenu('create-service')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Buat Layanan</span>
        </button>
      </div>

      {/* 4 Kartu Metrik Utama - Flat & Minimalist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Pendapatan Bulanan
            </span>
            <TrendingUp className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {formatRupiah(totalSalesRevenue)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {activeServices.length} layanan aktif
          </p>
        </div>

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
            {customers.filter((c) => c.status === 'Aktif').length} berstatus aktif
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Komisi Siap Cair
            </span>
            <Wallet className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700">
            {formatRupiah(feeMetrics.availableSalesFee)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Pool: {formulaConfig.marketingPoolPercentage}% margin
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Penawaran Disetujui
            </span>
            <FileText className="w-4 h-4 text-sky-700" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {acceptedQuotations.length}{' '}
            <span className="text-xs font-normal text-slate-400">/ {quotations.length}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Quotation closing
          </p>
        </div>
      </div>

      {/* 2 Kolom Ringkas: Penawaran & Pencairan Terkini */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Penawaran Terakhir */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Penawaran Terkini
            </h3>
            <button
              onClick={() => setActiveMenu('quotations')}
              className="text-xs text-teal-800 hover:text-teal-900 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
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
                      {customer?.companyName || 'Prospek Klien'}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {q.id} • {q.bandwidthMbps} Mbps
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-semibold text-slate-900 font-mono block">
                      {formatRupiah(q.dpp)}
                    </span>
                    <span
                      className={`inline-block text-[10px] font-medium px-1.5 py-0.2 rounded border mt-0.5 ${
                        q.status === 'Accepted'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {q.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pencairan Komisi Terkini */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Pencairan Komisi Terkini
            </h3>
            <button
              onClick={() => setActiveMenu('marketing-fee')}
              className="text-xs text-teal-800 hover:text-teal-900 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              Kelola Fee <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {withdrawals.slice(0, 4).map((w) => {
              const isPaid = w.status === 'Paid';
              return (
                <div
                  key={w.id}
                  className="p-3 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {w.recipientName}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {w.recipientRole} • {w.date}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-semibold text-slate-900 font-mono block">
                      {formatRupiah(w.amount)}
                    </span>
                    <span
                      className={`inline-block text-[10px] font-medium px-1.5 py-0.2 rounded border mt-0.5 ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {isPaid ? 'Lunas' : 'Menunggu'}
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
