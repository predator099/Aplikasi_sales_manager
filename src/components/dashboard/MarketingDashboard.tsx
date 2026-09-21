import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatBandwidth } from '../../utils/formatters';
import {
  TrendingUp,
  FileText,
  Wallet,
  Target,
  ChevronRight,
  PieChart,
  Layers,
  Sparkles,
  Send,
  CheckCircle2,
  Clock,
  Briefcase,
  Globe,
  LayoutDashboard,
} from 'lucide-react';

export const MarketingDashboard: React.FC = () => {
  const {
    customers,
    services,
    quotations,
    withdrawals,
    formulaConfig,
    pricingConfig,
    setActiveMenu,
  } = useApp();

  // Layanan aktif
  const activeServices = useMemo(() => {
    return services.filter((s) => s.status === 'Aktif');
  }, [services]);

  // Total Marketing Pool
  const marketingPoolMetrics = useMemo(() => {
    let totalPool = 0;
    activeServices.forEach((s) => {
      const a = s.pricingAllocation;
      if (a?.marketingPool) {
        totalPool += a.marketingPool.amount || 0;
      }
    });

    const paidWithdrawals = withdrawals
      .filter((w) => w.status === 'Paid')
      .reduce((acc, w) => acc + w.amount, 0);

    const pendingWithdrawals = withdrawals
      .filter((w) => w.status === 'Pending')
      .reduce((acc, w) => acc + w.amount, 0);

    const availablePool = Math.max(0, totalPool - (paidWithdrawals + pendingWithdrawals));

    return {
      totalPool,
      paidWithdrawals,
      pendingWithdrawals,
      availablePool,
    };
  }, [activeServices, withdrawals]);

  // Metrik Penawaran
  const quotationMetrics = useMemo(() => {
    const total = quotations.length;
    const accepted = quotations.filter((q) => q.status === 'Accepted').length;
    const sent = quotations.filter((q) => q.status === 'Sent').length;
    const draft = quotations.filter((q) => q.status === 'Draft').length;
    const rejected = quotations.filter((q) => q.status === 'Rejected' || q.status === 'Expired').length;

    const totalDpp = quotations.reduce((acc, q) => acc + (q.dpp || 0), 0);
    const acceptedDpp = quotations
      .filter((q) => q.status === 'Accepted')
      .reduce((acc, q) => acc + (q.dpp || 0), 0);

    const closingRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

    return {
      total,
      accepted,
      sent,
      draft,
      rejected,
      totalDpp,
      acceptedDpp,
      closingRate,
    };
  }, [quotations]);

  // Rata-rata bandwidth
  const avgBandwidth = useMemo(() => {
    if (activeServices.length === 0) return 0;
    const total = activeServices.reduce((acc, s) => acc + (s.bandwidthMbps || 0), 0);
    return Math.round(total / activeServices.length);
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
            onClick={() => setActiveMenu('master-pricing')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>Katalog Paket</span>
          </button>
          <button
            onClick={() => setActiveMenu('quotations')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Penawaran</span>
          </button>
        </div>
      </div>

      {/* 4 Kartu Metrik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Marketing Pool */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Marketing Pool
            </span>
            <Wallet className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-700">
            {formatRupiah(marketingPoolMetrics.totalPool)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Alokasi {formulaConfig.marketingPoolPercentage}% dari margin
          </p>
        </div>

        {/* Nilai Pipeline Penawaran */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Pipeline Penawaran
            </span>
            <FileText className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {formatRupiah(quotationMetrics.totalDpp)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {quotationMetrics.total} total dokumen diterbitkan
          </p>
        </div>

        {/* Closing Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Rasio Closing
            </span>
            <Sparkles className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700">
            {quotationMetrics.closingRate}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {quotationMetrics.accepted} Disetujui ({formatRupiah(quotationMetrics.acceptedDpp)})
          </p>
        </div>

        {/* Rata-rata Bandwidth */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Rata-rata Bandwidth
            </span>
            <TrendingUp className="w-4 h-4 text-sky-700" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {formatBandwidth(avgBandwidth)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {activeServices.length} klien aktif terpasang
          </p>
        </div>
      </div>

      {/* Grid 2 Kolom: Pipeline Penawaran & Alokasi Pool */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pipeline Penawaran Visual */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-slate-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Status Pipeline Penawaran
              </h3>
            </div>
            <button
              onClick={() => setActiveMenu('quotations')}
              className="text-xs text-teal-800 hover:text-teal-900 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              Semua <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 space-y-3.5">
            {/* Accepted */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Disetujui (Accepted)
                </span>
                <span className="font-mono text-slate-600">
                  {quotationMetrics.accepted} Dokumen
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{
                    width: `${quotationMetrics.total > 0 ? (quotationMetrics.accepted / quotationMetrics.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Sent */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-sky-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span> Dikirim ke Klien (Sent)
                </span>
                <span className="font-mono text-slate-600">
                  {quotationMetrics.sent} Dokumen
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-sky-500 h-2 rounded-full"
                  style={{
                    width: `${quotationMetrics.total > 0 ? (quotationMetrics.sent / quotationMetrics.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Draft */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span> Draf Penawaran (Draft)
                </span>
                <span className="font-mono text-slate-600">
                  {quotationMetrics.draft} Dokumen
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-slate-400 h-2 rounded-full"
                  style={{
                    width: `${quotationMetrics.total > 0 ? (quotationMetrics.draft / quotationMetrics.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Rejected / Expired */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-rose-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span> Ditolak / Berakhir
                </span>
                <span className="font-mono text-slate-600">
                  {quotationMetrics.rejected} Dokumen
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-rose-400 h-2 rounded-full"
                  style={{
                    width: `${quotationMetrics.total > 0 ? (quotationMetrics.rejected / quotationMetrics.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Alokasi & Pencairan Marketing Pool */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-slate-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Alokasi Marketing Pool
              </h3>
            </div>
            <button
              onClick={() => setActiveMenu('marketing-fee')}
              className="text-xs text-teal-800 hover:text-teal-900 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              Kelola Fee <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Total Pool Terkumpul
                </span>
                <span className="text-sm font-bold font-mono text-slate-900 block mt-1">
                  {formatRupiah(marketingPoolMetrics.totalPool)}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block">
                  Pool Siap Dicairkan
                </span>
                <span className="text-sm font-bold font-mono text-emerald-800 block mt-1">
                  {formatRupiah(marketingPoolMetrics.availablePool)}
                </span>
              </div>
            </div>

            <div className="pt-2 text-xs">
              <p className="text-slate-500 text-[11px] mb-2 font-medium">
                Pencairan Komisi & Fee Terkini:
              </p>
              <div className="divide-y divide-slate-100">
                {withdrawals.slice(0, 3).map((w) => (
                  <div key={w.id} className="py-2 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{w.recipientName}</p>
                      <p className="text-[10px] text-slate-400">{w.recipientRole} • {w.date}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-semibold text-slate-900 block">
                        {formatRupiah(w.amount)}
                      </span>
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1 rounded">
                        {w.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Bawah: Penawaran Terkini & Tier Bandwidth Populer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Penawaran Baru */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Penawaran Baru
              </h3>
            </div>
            <button
              onClick={() => setActiveMenu('quotations')}
              className="text-xs text-teal-800 hover:text-teal-900 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              Semua <ChevronRight className="w-3.5 h-3.5" />
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
                      {customer?.companyName || 'Calon Pelanggan'}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {q.id} • {q.bandwidthMbps} Mbps • Exp: {q.validUntil}
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

        {/* Tier Paket Internet Populer */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Katalog Paket Acuan Pasar
              </h3>
            </div>
            <button
              onClick={() => setActiveMenu('master-pricing')}
              className="text-xs text-teal-800 hover:text-teal-900 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              Konfigurasi <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {pricingConfig.bandwidthTiers.slice(0, 4).map((tier) => (
              <div
                key={tier.id}
                className="p-3 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {tier.bandwidthMbps} Mbps
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {tier.name || 'Dedicated Internet'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-semibold text-slate-900 block">
                    {formatRupiah(tier.price)}
                  </span>
                  <span className="text-[10px] text-slate-400">/ bulan</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
