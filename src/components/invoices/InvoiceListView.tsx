import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';
import { InvoiceStatusBadge } from '../common/Badge';
import { InvoicePaymentModal } from './InvoicePaymentModal';
import { InvoicePreviewModal } from './InvoicePreviewModal';
import { formatRupiah, formatDate } from '../../utils/formatters';
import {
  ReceiptText,
  Search,
  SlidersHorizontal,
  CreditCard,
  Eye,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

export const InvoiceListView: React.FC = () => {
  const { invoices, customers, services, addInvoice } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Manual create state
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [billingPeriod, setBillingPeriod] = useState('Maret 2026');
  const [dueDate, setDueDate] = useState('2026-03-25');

  // Metrics
  const metrics = useMemo(() => {
    let totalBilled = 0;
    let totalPaid = 0;
    let overdueCount = 0;

    invoices.forEach((inv) => {
      totalBilled += inv.total;
      totalPaid += inv.paidAmount;
      if (inv.paymentStatus === 'Overdue') {
        overdueCount++;
      }
    });

    const totalUnpaid = Math.max(0, totalBilled - totalPaid);

    return { totalBilled, totalPaid, totalUnpaid, overdueCount };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const cust = customers.find((c) => c.id === inv.customerId);
      const searchTarget = `${inv.id} ${cust?.companyName || ''} ${cust?.fullName || ''} ${inv.billingPeriod}`.toLowerCase();
      const matchSearch = searchTarget.includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || inv.paymentStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, customers, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / itemsPerPage));
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(start, start + itemsPerPage);
  }, [filteredInvoices, currentPage]);

  const handleManualCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const targetService = services.find((s) => s.id === selectedServiceId) || services[0];
    if (!targetService) return;

    addInvoice({
      customerId: targetService.customerId,
      serviceId: targetService.id,
      billingPeriod,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate,
      subtotal: targetService.subtotal,
      dpp: targetService.dpp,
      ppnAmount: targetService.ppnAmount,
      total: targetService.totalMonthly,
      paidAmount: 0,
      paymentStatus: 'Unpaid',
      serviceDescription: `Layanan Internet ISP & Metro-E (${targetService.bandwidthMbps} Mbps)`,
      paymentHistory: [],
    });

    setCreateModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Faktur
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              {invoices.length} Faktur
            </span>
          </div>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Terbitkan Faktur Baru</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Tagihan Belum Lunas
            </span>
            <span className="text-lg font-bold font-mono text-rose-600 mt-1 block">
              {formatRupiah(metrics.totalUnpaid)}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Kas Masuk (Terbayar)
            </span>
            <span className="text-lg font-bold font-mono text-emerald-600 mt-1 block">
              {formatRupiah(metrics.totalPaid)}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Faktur Jatuh Tempo
            </span>
            <span className="text-lg font-bold font-mono text-amber-600 mt-1 block">
              {metrics.overdueCount} Faktur
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari ID faktur, instansi, atau periode..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-600">Status Pembayaran:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
          >
            <option value="all">Semua Status</option>
            <option value="Unpaid">Belum Bayar (Unpaid)</option>
            <option value="Partial">Sebagian (Partial)</option>
            <option value="Paid">Lunas (Paid)</option>
            <option value="Overdue">Jatuh Tempo (Overdue)</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4">No. Faktur</th>
                <th className="py-2.5 px-4">Instansi / Pelanggan</th>
                <th className="py-2.5 px-4">Periode</th>
                <th className="py-2.5 px-4">Tgl. Terbit</th>
                <th className="py-2.5 px-4">Jatuh Tempo</th>
                <th className="py-2.5 px-4">Total Tagihan</th>
                <th className="py-2.5 px-4">Terbayar</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <ReceiptText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-medium">Tidak ada data faktur yang sesuai.</p>
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv) => {
                  const cust = customers.find((c) => c.id === inv.customerId);
                  const remaining = Math.max(0, inv.total - inv.paidAmount);

                  return (
                    <tr
                      key={inv.id}
                      onClick={() => setPreviewInvoice(inv)}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {inv.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{cust?.companyName}</div>
                        <div className="text-[10px] text-slate-400">
                          {inv.serviceDescription || 'Layanan ISP'}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {inv.billingPeriod}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {formatDate(inv.issueDate)}
                      </td>
                      <td className="py-3 px-4 text-rose-600 font-medium whitespace-nowrap">
                        {formatDate(inv.dueDate)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatRupiah(inv.total)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono">
                        <span className="font-semibold text-emerald-700">
                          {formatRupiah(inv.paidAmount)}
                        </span>
                        {remaining > 0 && (
                          <span className="block text-[10px] text-rose-500 font-sans">
                            Sisa: {formatRupiah(remaining)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <InvoiceStatusBadge status={inv.paymentStatus} />
                      </td>
                      <td
                        className="py-3 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewInvoice(inv)}
                            title="Lihat Pratinjau Faktur"
                            className="p-1.5 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {inv.paymentStatus !== 'Paid' && (
                            <button
                              onClick={() => setPaymentInvoice(inv)}
                              title="Catat Pembayaran Masuk"
                              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-semibold text-[11px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                            >
                              <CreditCard className="w-3 h-3 text-emerald-400" />
                              <span>Bayar</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3.5 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Menampilkan{' '}
            <span className="font-semibold text-slate-900">
              {filteredInvoices.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{' '}
            -{' '}
            <span className="font-semibold text-slate-900">
              {Math.min(currentPage * itemsPerPage, filteredInvoices.length)}
            </span>{' '}
            dari <span className="font-semibold text-slate-900">{filteredInvoices.length}</span> tagihan
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2.5 py-1 font-mono font-medium text-[11px] bg-white border border-slate-200 rounded-md">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <InvoicePaymentModal
        invoice={paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
      />

      {/* Invoice Preview Modal */}
      <InvoicePreviewModal
        invoice={previewInvoice}
        onClose={() => setPreviewInvoice(null)}
        onOpenPaymentModal={(inv) => setPaymentInvoice(inv)}
      />

      {/* Manual Generate Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ReceiptText className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Terbitkan Faktur Tagihan Baru
                </h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualCreate} className="space-y-4 text-xs mt-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Layanan Pelanggan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                >
                  {services.map((svc) => {
                    const c = customers.find((cust) => cust.id === svc.customerId);
                    return (
                      <option key={svc.id} value={svc.id}>
                        {c?.companyName} — {svc.bandwidthMbps} Mbps ({formatRupiah(svc.totalMonthly)}/bln)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Periode Tagihan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: April 2026"
                  value={billingPeriod}
                  onChange={(e) => setBillingPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-400 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tanggal Jatuh Tempo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-400 bg-white"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-slate-900 hover:bg-slate-800 rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Terbitkan Faktur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
