import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatDate } from '../../utils/formatters';
import {
  Wallet,
  Briefcase,
  Users,
  FileText,
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Building2,
  Phone,
  UserCheck,
  PlusCircle,
  AlertCircle,
  Inbox,
  LayoutDashboard,
} from 'lucide-react';

export const SalesDashboard: React.FC = () => {
  const {
    currentUser,
    customers,
    services,
    quotations,
    withdrawals,
    setActiveMenu,
  } = useApp();

  // Pencocokan identitas Sales saat ini (berdasarkan nama lengkap atau username)
  const currentUserNameLower = (currentUser.name || '').trim().toLowerCase();
  const currentUserUsernameLower = (currentUser.username || '').trim().toLowerCase();

  const isMyCustomer = (salesName?: string) => {
    if (!salesName) return false;
    const s = salesName.trim().toLowerCase();
    return s === currentUserNameLower || s === currentUserUsernameLower;
  };

  // 1. Pelanggan khusus milik Sales yang sedang login (TIDAK campur dengan sales lain)
  const myCustomers = useMemo(() => {
    return customers.filter((c) => isMyCustomer(c.salesName));
  }, [customers, currentUser]);

  const myCustomerIds = useMemo(() => {
    return new Set(myCustomers.map((c) => c.id));
  }, [myCustomers]);

  const activeMyCustomersCount = myCustomers.filter((c) => c.status === 'Aktif').length;
  const prospectMyCustomersCount = myCustomers.filter((c) => c.status === 'Prospek').length;

  // 2. Layanan aktif khusus pelanggan milik Sales ini
  const myActiveServices = useMemo(() => {
    return services.filter(
      (s) => s.status === 'Aktif' && myCustomerIds.has(s.customerId)
    );
  }, [services, myCustomerIds]);

  // 3. Penawaran (Quotations) khusus milik Sales ini
  const myQuotations = useMemo(() => {
    return quotations.filter((q) => {
      if (myCustomerIds.has(q.customerId)) return true;
      if (isMyCustomer((q as any).salesName)) return true;
      return false;
    });
  }, [quotations, myCustomerIds, currentUser]);

  const acceptedQuotations = useMemo(() => {
    return myQuotations.filter((q) => q.status === 'Accepted');
  }, [myQuotations]);

  const pendingQuotations = useMemo(() => {
    return myQuotations.filter((q) => q.status === 'Sent' || q.status === 'Draft');
  }, [myQuotations]);

  const myQuotationTotalValue = useMemo(() => {
    return myQuotations.reduce((acc, q) => acc + (q.dpp || 0), 0);
  }, [myQuotations]);

  // 4. Catatan penarikan komisi khusus user ini
  const myWithdrawals = useMemo(() => {
    return withdrawals.filter((w) => {
      const rec = (w.recipientName || '').trim().toLowerCase();
      return rec === currentUserNameLower || rec === currentUserUsernameLower;
    });
  }, [withdrawals, currentUser]);

  // 5. Perhitungan komisi khusus Sales ini
  const salesCommissionMetrics = useMemo(() => {
    // Total komisi didapat hanya dari layanan aktif pelanggan milik sales ini
    let totalSalesFee = 0;
    myActiveServices.forEach((s) => {
      const a = s.pricingAllocation;
      if (a?.sales) {
        totalSalesFee += a.sales.amount || 0;
      }
    });

    const paidWithdrawals = myWithdrawals
      .filter((w) => w.status === 'Paid')
      .reduce((acc, w) => acc + w.amount, 0);

    const pendingWithdrawals = myWithdrawals
      .filter((w) => w.status === 'Pending')
      .reduce((acc, w) => acc + w.amount, 0);

    const availableSalesFee = Math.max(
      0,
      totalSalesFee - (paidWithdrawals + pendingWithdrawals)
    );

    return {
      totalSalesFee,
      paidWithdrawals,
      pendingWithdrawals,
      availableSalesFee,
    };
  }, [myActiveServices, myWithdrawals]);

  const closingRate =
    myQuotations.length > 0
      ? Math.round((acceptedQuotations.length / myQuotations.length) * 100)
      : 0;

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
            onClick={() => setActiveMenu('marketing-fee')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tarik Komisi</span>
          </button>
          <button
            onClick={() => setActiveMenu('customers')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Klien Saya</span>
          </button>
        </div>
      </div>

      {/* 4 Kartu Metrik Utama Pribadi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Komisi Siap Tarik */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-linear-to-br from-white to-emerald-50/25 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-emerald-800 uppercase tracking-wider">
              Komisi Siap Tarik
            </span>
            <Wallet className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700">
            {formatRupiah(salesCommissionMetrics.availableSalesFee)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Saldo bersih siap dicairkan
          </p>
        </div>

        {/* Total Akumulasi Komisi */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Total Komisi Anda
            </span>
            <TrendingUp className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {formatRupiah(salesCommissionMetrics.totalSalesFee)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Dari {myActiveServices.length} layanan aktif klien Anda
          </p>
        </div>

        {/* Closing Penawaran */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Penawaran Closing
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {acceptedQuotations.length}{' '}
            <span className="text-xs font-normal text-slate-400">
              / {myQuotations.length} penawaran ({closingRate}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {pendingQuotations.length} penawaran sedang proses
          </p>
        </div>

        {/* Pelanggan Ditangani */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Klien Terdaftar Anda
            </span>
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {myCustomers.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {activeMyCustomersCount} Aktif • {prospectMyCustomersCount} Prospek
          </p>
        </div>
      </div>

      {/* Grid 2 Kolom: Dompet Komisi Saya & Penawaran Klien Saya */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Status Dompet Komisi Sales */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-slate-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Status Dompet Komisi Pribadi
              </h3>
            </div>
            <button
              onClick={() => setActiveMenu('marketing-fee')}
              className="text-xs text-teal-800 hover:text-teal-900 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              Ajukan Penarikan <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block">
                  Siap Tarik
                </span>
                <span className="text-xs font-bold font-mono text-emerald-700 block mt-1 truncate">
                  {formatRupiah(salesCommissionMetrics.availableSalesFee)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider block">
                  Diproses
                </span>
                <span className="text-xs font-bold font-mono text-amber-700 block mt-1 truncate">
                  {formatRupiah(salesCommissionMetrics.pendingWithdrawals)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider block">
                  Telah Cair
                </span>
                <span className="text-xs font-bold font-mono text-slate-800 block mt-1 truncate">
                  {formatRupiah(salesCommissionMetrics.paidWithdrawals)}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[11px] font-medium text-slate-500 mb-2">
                Riwayat Penarikan Komisi Anda:
              </p>
              {myWithdrawals.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {myWithdrawals.slice(0, 4).map((w) => (
                    <div key={w.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-800">{w.notes || 'Penarikan Fee Sales'}</p>
                        <p className="text-[10px] text-slate-400">
                          {w.date} {w.customerName && `• ${w.customerName}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-semibold text-slate-900 block">
                          {formatRupiah(w.amount)}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                            w.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {w.status === 'Paid' ? 'Lunas' : 'Menunggu Approval'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                  <Inbox className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                  <p className="text-xs">Belum ada riwayat penarikan komisi untuk akun Anda.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pipeline Closing Penawaran Klien Saya */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Penawaran Klien Anda
              </h3>
            </div>
            <button
              onClick={() => setActiveMenu('quotations')}
              className="text-xs text-teal-800 hover:text-teal-900 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              Semua Penawaran <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {myQuotations.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {myQuotations.slice(0, 4).map((q) => {
                const customer = customers.find((c) => c.id === q.customerId);
                const isAccepted = q.status === 'Accepted';
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
                        {q.id} • {q.bandwidthMbps} Mbps • {formatDate(q.createdAt)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-semibold text-slate-900 font-mono block">
                        {formatRupiah(q.dpp)}
                      </span>
                      <span
                        className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded border mt-0.5 ${
                          isAccepted
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {q.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50/40">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Belum Ada Dokumen Penawaran</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                Buat dokumen penawaran harga internet & metro ethernet untuk calon klien Anda.
              </p>
              <button
                onClick={() => setActiveMenu('quotations')}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer shadow-2xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Buat Penawaran</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid Bawah: Klien Saya */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Klien Saya
            </h3>
          </div>
          <button
            onClick={() => setActiveMenu('customers')}
            className="text-xs text-teal-800 hover:text-teal-900 font-semibold flex items-center gap-0.5 cursor-pointer"
          >
            Database Pelanggan <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {myCustomers.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {myCustomers.map((c) => (
              <div
                key={c.id}
                className="p-3 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{c.companyName}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>PIC: {c.fullName}</span>
                    {c.whatsapp && (
                      <span className="flex items-center gap-0.5">
                        • <Phone className="w-3 h-3" /> {c.whatsapp}
                      </span>
                    )}
                    <span>• Kota: {c.city}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      c.status === 'Aktif'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50/40">
            <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">Belum Ada Klien Ditugaskan</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
              Saat ini belum ada data pelanggan yang ditautkan ke akun Anda ({currentUser.name}). 
              Silakan tambahkan pelanggan baru atau hubungi Administrator.
            </p>
            <button
              onClick={() => setActiveMenu('customers')}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Tambah Pelanggan Baru</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
