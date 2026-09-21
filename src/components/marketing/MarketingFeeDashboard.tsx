import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatDate } from '../../utils/formatters';
import {
  Users,
  Briefcase,
  UserCheck,
  Building,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Layers,
  ArrowUpRight,
  Filter,
  Search,
  ChevronRight,
  Sparkles,
  ArrowDown,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { FeeWithdrawalRecord } from '../../types';
import { FEE_RULES } from '../../utils/pricingEngine';
import { Sliders } from 'lucide-react';

export const MarketingFeeDashboard: React.FC = () => {
  const {
    services,
    customers,
    currentUser,
    withdrawals,
    addWithdrawal,
    updateWithdrawalStatus,
    setActiveMenu,
    formulaConfig,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'Sales' | 'AM' | 'Marketing'>('all');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Withdrawal form state
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || '');
  const [recipientName, setRecipientName] = useState<string>(currentUser.name || 'Rian Pratama');
  const [recipientRole, setRecipientRole] = useState<'Sales' | 'AM' | 'Marketing'>('Sales');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(500000);
  const [withdrawNotes, setWithdrawNotes] = useState<string>('');

  // Active services with pricing allocation
  const servicesWithAlloc = useMemo(() => {
    return services.filter((s) => s.status === 'Aktif' && s.pricingAllocation);
  }, [services]);

  // Selected service and system-calculated fee for withdrawal
  const selectedService = useMemo(() => {
    return (
      servicesWithAlloc.find((s) => s.id === selectedServiceId) ||
      servicesWithAlloc[0]
    );
  }, [servicesWithAlloc, selectedServiceId]);

  const systemCalculatedFee = useMemo(() => {
    if (!selectedService?.pricingAllocation) return 0;
    const alloc = selectedService.pricingAllocation;
    if (recipientRole === 'Sales') return alloc.sales?.amount || 0;
    if (recipientRole === 'AM') return alloc.am?.amount || 0;
    return alloc.marketingPool?.amount || 0;
  }, [selectedService, recipientRole]);

  // Keep withdrawAmount in sync with systemCalculatedFee
  useEffect(() => {
    if (systemCalculatedFee > 0) {
      setWithdrawAmount(systemCalculatedFee);
    }
  }, [systemCalculatedFee]);

  // Aggregate Metrics based on hierarchical rules
  const metrics = useMemo(() => {
    let totalMargin = 0;
    let totalKantor = 0;
    let totalMarketingPool = 0;
    let totalSales = 0;
    let totalAm = 0;

    servicesWithAlloc.forEach((s) => {
      const a = s.pricingAllocation;
      if (a) {
        totalMargin += a.margin || 0;
        totalKantor += a.kantor?.amount || 0;
        totalMarketingPool += a.marketingPool?.amount || 0;
        totalSales += a.sales?.amount || 0;
        totalAm += a.am?.amount || 0;
      }
    });

    // Calculate Paid and Pending from withdrawals
    const totalPaid = withdrawals
      .filter((w) => w.status === 'Paid')
      .reduce((acc, w) => acc + w.amount, 0);

    const totalPending = withdrawals
      .filter((w) => w.status === 'Pending')
      .reduce((acc, w) => acc + w.amount, 0);

    // Available balance is based on Marketing Pool minus (Paid + Pending)
    const availablePoolBalance = Math.max(0, totalMarketingPool - (totalPaid + totalPending));

    // Role-specific available balances
    const paidSales = withdrawals
      .filter((w) => w.status === 'Paid' && w.recipientRole === 'Sales')
      .reduce((acc, w) => acc + w.amount, 0);
    const pendingSales = withdrawals
      .filter((w) => w.status === 'Pending' && w.recipientRole === 'Sales')
      .reduce((acc, w) => acc + w.amount, 0);
    const availableSales = Math.max(0, totalSales - (paidSales + pendingSales));

    const paidAm = withdrawals
      .filter((w) => w.status === 'Paid' && w.recipientRole === 'AM')
      .reduce((acc, w) => acc + w.amount, 0);
    const pendingAm = withdrawals
      .filter((w) => w.status === 'Pending' && w.recipientRole === 'AM')
      .reduce((acc, w) => acc + w.amount, 0);
    const availableAm = Math.max(0, totalAm - (paidAm + pendingAm));

    return {
      totalMargin,
      totalKantor,
      totalMarketingPool,
      totalSales,
      totalAm,
      totalPaid,
      totalPending,
      availablePoolBalance,
      paidSales,
      pendingSales,
      availableSales,
      paidAm,
      pendingAm,
      availableAm,
    };
  }, [servicesWithAlloc, withdrawals]);

  // Handle submit withdrawal
  const handleRequestWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveAmount = systemCalculatedFee > 0 ? systemCalculatedFee : withdrawAmount;
    if (effectiveAmount <= 0) return;

    const svc = services.find((s) => s.id === selectedServiceId);
    const cust = customers.find((c) => c.id === svc?.customerId);

    addWithdrawal({
      serviceId: selectedServiceId,
      customerName: cust?.companyName || 'Pelanggan Dedicated ISP',
      recipientName,
      recipientRole,
      amount: effectiveAmount,
      date: new Date().toISOString().slice(0, 10),
      status: 'Pending',
      notes: withdrawNotes,
    });

    setIsWithdrawModalOpen(false);
    setWithdrawNotes('');
  };

  const isFinanceOrAdmin =
    currentUser.role === 'Administrator' ||
    currentUser.role === 'Super Admin' ||
    currentUser.role === 'Finance' ||
    currentUser.role === 'Marketing';

  // Filtered withdrawals
  const filteredWithdrawals = withdrawals.filter((w) => {
    const matchesSearch =
      w.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.customerName && w.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      w.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || w.recipientRole === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
            Fee & Komisi Sales
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Ajukan Pencairan</span>
          </button>
        </div>
      </div>

      {/* 4 Key Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Marketing Pool */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
            Marketing Pool
          </span>
          <span className="text-lg font-bold text-slate-900 font-mono mt-1 block">
            {formatRupiah(metrics.totalMarketingPool)}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {formulaConfig.marketingPoolPercentage}% Total Margin
          </span>
        </div>

        {/* 2. Saldo Siap Cair */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
            Saldo Tersedia
          </span>
          <span className="text-lg font-bold text-emerald-700 font-mono mt-1 block">
            {formatRupiah(metrics.availablePoolBalance)}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Siap dicairkan
          </span>
        </div>

        {/* 3. Menunggu Approval */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
            Menunggu Approval
          </span>
          <span className="text-lg font-bold text-amber-600 font-mono mt-1 block">
            {formatRupiah(metrics.totalPending)}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Dalam proses kasir
          </span>
        </div>

        {/* 4. Tertransfer */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
            Telah Dicairkan
          </span>
          <span className="text-lg font-bold text-slate-900 font-mono mt-1 block">
            {formatRupiah(metrics.totalPaid)}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Total transfer berhasil
          </span>
        </div>
      </div>

      {/* Role Switcher Note & Personal Balance Alert for Sales / AM */}
      {(currentUser.role === 'Sales' || currentUser.role === 'AM') && (
        <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              {currentUser.role === 'Sales' ? <Briefcase className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-xs text-slate-300 block">
                Tampilan Peran Aktif: <strong className="text-white">{currentUser.name} ({currentUser.role})</strong>
              </span>
              <span className="text-xs text-teal-300 font-medium">
                Alokasi Anda: {formatRupiah(currentUser.role === 'Sales' ? metrics.totalSales : metrics.totalAm)} | 
                Saldo Siap Tarik: {formatRupiah(currentUser.role === 'Sales' ? metrics.availableSales : metrics.availableAm)}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setRecipientName(currentUser.name);
              setRecipientRole(currentUser.role === 'AM' ? 'AM' : 'Sales');
              setIsWithdrawModalOpen(true);
            }}
            className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
          >
            Tarik Saldo Saya
          </button>
        </div>
      )}

      {/* Two Main Sections: Active Services with Hierarchical Breakdown & Withdrawal Records */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (7 cols): List of Services with Margin & Fee Structure */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-200/80 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">
                Struktur Margin Layanan Pelanggan ({servicesWithAlloc.length})
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Harga Bottom → Jual → Margin
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {servicesWithAlloc.map((svc) => {
              const cust = customers.find((c) => c.id === svc.customerId);
              const alloc = svc.pricingAllocation;
              if (!alloc) return null;

              return (
                <div key={svc.id} className="p-4 hover:bg-slate-50/60 transition-colors space-y-3">
                  {/* Service Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-900">
                          {svc.id}
                        </span>
                        <span className="text-xs font-semibold text-slate-900">
                          {cust?.companyName || svc.customerId}
                        </span>
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded">
                          {svc.bandwidthMbps} Mbps
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {cust?.fullName} ({cust?.city || 'Bandung'}) • Terdaftar {formatDate(svc.createdAt)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-700 font-mono block">
                        Margin: {formatRupiah(alloc.margin)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans">
                        Bottom: {formatRupiah(alloc.bottomPrice)} | Jual: {formatRupiah(alloc.sellingPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Hierarchical Tree Visual Card */}
                  <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/80 text-xs space-y-2">
                    {/* Level 1: Kantor vs Marketing Pool */}
                    <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200">
                      <div className="flex items-center justify-between bg-white p-2 rounded-md border border-slate-200">
                        <span className="text-[11px] text-slate-600 flex items-center gap-1.5">
                          <Building className="w-3 h-3 text-slate-500" />
                          Kantor ({alloc.kantor.percentage}%)
                        </span>
                        <span className="font-semibold text-slate-900 font-mono">
                          {formatRupiah(alloc.kantor.amount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-white p-2 rounded-md border border-slate-200">
                        <span className="text-[11px] text-slate-800 font-semibold flex items-center gap-1.5">
                          <Users className="w-3 h-3 text-slate-700" />
                          Pool Marketing ({alloc.marketingPool.percentage}%)
                        </span>
                        <span className="font-bold text-slate-900 font-mono">
                          {formatRupiah(alloc.marketingPool.amount)}
                        </span>
                      </div>
                    </div>

                    {/* Level 2: Inside Pool Marketing -> Sales and AM */}
                    <div className="pl-3 border-l-2 border-slate-200 space-y-1.5 text-[11px]">
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-mono">├──</span>
                          <span className="font-medium text-slate-800">Sales ({alloc.sales.percentage}% dari Pool)</span>
                        </span>
                        <span className="font-semibold text-amber-800 font-mono">
                          {formatRupiah(alloc.sales.amount)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-mono">└──</span>
                          <span className="font-medium text-slate-800">AM ({alloc.am.percentage}% dari Pool)</span>
                        </span>
                        <span className="font-semibold text-purple-800 font-mono">
                          {formatRupiah(alloc.am.amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 cols): Withdrawals & Fee Disbursements */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden space-y-3.5">
          <div className="p-3.5 border-b border-slate-200/80 flex items-center justify-between bg-white">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Pencairan Komisi ({filteredWithdrawals.length})
              </h2>
              <p className="text-[11px] text-slate-400">
                Riwayat permohonan dan pembayaran komisi
              </p>
            </div>
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="text-xs font-semibold text-slate-900 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Ajukan
            </button>
          </div>

          {/* Search & Role Filter */}
          <div className="px-3.5 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari penerima atau ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-400 text-slate-800"
              />
            </div>

            <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-medium">
              {(['all', 'Sales', 'AM', 'Marketing'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRole(r)}
                  className={`flex-1 py-1 rounded transition-colors cursor-pointer ${
                    filterRole === r
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {r === 'all' ? 'Semua' : r}
                </button>
              ))}
            </div>
          </div>

          {/* Withdrawal List */}
          <div className="px-3.5 pb-3.5 divide-y divide-slate-100 max-h-[480px] overflow-y-auto space-y-3">
            {filteredWithdrawals.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Tidak ada data permohonan pencairan fee.
              </div>
            ) : (
              filteredWithdrawals.map((w) => (
                <div key={w.id} className="pt-3 first:pt-0 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-slate-700">
                          {w.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                            w.recipientRole === 'Sales'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : w.recipientRole === 'AM'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : 'bg-teal-50 text-teal-800 border-teal-200'
                          }`}
                        >
                          {w.recipientRole}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-900 block mt-0.5">
                        {w.recipientName}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-slate-900 font-mono block">
                        {formatRupiah(w.amount)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          w.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {w.status === 'Paid' ? (
                          <>
                            <CheckCircle2 className="w-2.5 h-2.5" /> Paid
                          </>
                        ) : (
                          <>
                            <Clock className="w-2.5 h-2.5" /> Pending
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>
                      {w.customerName ? `${w.customerName}` : 'Fee Reguler'} • {formatDate(w.date)}
                    </span>

                    {/* Action for Finance / Super Admin to approve */}
                    {isFinanceOrAdmin && w.status === 'Pending' && (
                      <button
                        type="button"
                        onClick={() => updateWithdrawalStatus(w.id, 'Paid')}
                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-semibold cursor-pointer shadow-xs"
                      >
                        Tandai Paid
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Withdrawal Request Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200/80 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Form Pengajuan Pencairan Fee
                </h3>
              </div>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestWithdrawal} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Layanan Pelanggan (Sumber Fee)
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium text-slate-900 bg-white"
                >
                  {servicesWithAlloc.map((s) => {
                    const cust = customers.find((c) => c.id === s.customerId);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.id} — {cust?.companyName || s.customerId} (Pool: {formatRupiah(s.pricingAllocation?.marketingPool.amount || 0)})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Penerima</label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Peran / Alokasi</label>
                  <select
                    value={recipientRole}
                    onChange={(e) => setRecipientRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium text-slate-900 bg-white"
                  >
                    <option value="Sales">Sales</option>
                    <option value="AM">Account Manager (AM)</option>
                    <option value="Marketing">Marketing Pool</option>
                  </select>
                </div>
              </div>

              {/* System Fee Breakdown for Selected Service */}
              {selectedService?.pricingAllocation && (
                <div className="p-3 bg-slate-900 text-white rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] border-b border-slate-800 pb-1.5">
                    <span className="text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Formula Sistem
                    </span>
                    <span className="text-emerald-400 font-mono font-bold">
                      Margin: {formatRupiah(selectedService.pricingAllocation.margin)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div className="p-1.5 bg-slate-800/80 rounded border border-slate-700">
                      <span className="text-slate-400 block">Kantor (60%)</span>
                      <span className="font-mono text-white font-bold block mt-0.5">
                        {formatRupiah(selectedService.pricingAllocation.kantor.amount)}
                      </span>
                    </div>
                    <div className="p-1.5 bg-slate-800/80 rounded border border-slate-700">
                      <span className="text-slate-300 block">Pool (40%)</span>
                      <span className="font-mono text-slate-200 font-bold block mt-0.5">
                        {formatRupiah(selectedService.pricingAllocation.marketingPool.amount)}
                      </span>
                    </div>
                    <div className="p-1.5 bg-slate-800/80 rounded border border-amber-500/30">
                      <span className="text-amber-300 block">
                        Hak {recipientRole} ({recipientRole === 'Sales' ? '75%' : recipientRole === 'AM' ? '25%' : '100%'})
                      </span>
                      <span className="font-mono text-amber-300 font-bold block mt-0.5">
                        {formatRupiah(systemCalculatedFee)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    Nominal Fee yang Dicairkan (Rp)
                  </label>
                  <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-500" /> Dihitung Sistem
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                    Rp
                  </span>
                  <input
                    type="text"
                    readOnly
                    value={formatRupiah(systemCalculatedFee).replace('Rp ', '')}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg font-bold font-mono text-slate-800 bg-slate-50 cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Nominal komisi dihitung otomatis dari margin layanan dan tidak dapat dimanipulasi manual.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan / Rekening Tujuan</label>
                <input
                  type="text"
                  placeholder="Contoh: BCA 8830192849 a/n Rian Pratama (Fee Q4)"
                  value={withdrawNotes}
                  onChange={(e) => setWithdrawNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="flex-1 py-2 px-3.5 border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold cursor-pointer transition-colors"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
