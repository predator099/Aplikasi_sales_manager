import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Quotation } from '../../types';
import { QuotationStatusBadge } from '../common/Badge';
import { QuotationPreviewModal } from './QuotationPreviewModal';
import { formatRupiah, formatBandwidth, formatDate } from '../../utils/formatters';
import {
  FileText,
  Search,
  SlidersHorizontal,
  Plus,
  Eye,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';

export const QuotationListView: React.FC = () => {
  const {
    quotations,
    customers,
    updateQuotationStatus,
    convertQuotationToInvoice,
    setActiveMenu,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      const cust = customers.find((c) => c.id === q.customerId);
      const searchTarget = `${q.id} ${cust?.companyName || ''} ${cust?.fullName || ''}`.toLowerCase();
      const matchSearch = searchTarget.includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || q.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [quotations, customers, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredQuotations.length / itemsPerPage));
  const paginatedQuotations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredQuotations.slice(start, start + itemsPerPage);
  }, [filteredQuotations, currentPage]);

  const handleConvertToInvoice = (qId: string) => {
    convertQuotationToInvoice(qId);
    setSelectedQuotation(null);
    setActiveMenu('invoices');
  };

  const handleStatusChange = (status: Quotation['status']) => {
    if (selectedQuotation) {
      updateQuotationStatus(selectedQuotation.id, status);
      setSelectedQuotation({ ...selectedQuotation, status });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Penawaran
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              {quotations.length} Dokumen
            </span>
          </div>
        </div>

        <button
          onClick={() => setActiveMenu('create-service')}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Buat Penawaran Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari ID penawaran, nama instansi, atau PIC..."
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
          <span className="text-xs font-medium text-slate-600">Status Dokumen:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
          >
            <option value="all">Semua Status</option>
            <option value="Draft">Konsep (Draft)</option>
            <option value="Sent">Terkirim (Sent)</option>
            <option value="Accepted">Disetujui (Accepted)</option>
            <option value="Rejected">Ditolak (Rejected)</option>
            <option value="Expired">Kedaluwarsa (Expired)</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4">No. Penawaran</th>
                <th className="py-2.5 px-4">Instansi / Pelanggan</th>
                <th className="py-2.5 px-4">Tanggal Terbit</th>
                <th className="py-2.5 px-4">Bandwidth</th>
                <th className="py-2.5 px-4">Total Biaya (inc. PPN)</th>
                <th className="py-2.5 px-4">Masa Berlaku</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedQuotations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-medium">Tidak ada data penawaran yang sesuai.</p>
                  </td>
                </tr>
              ) : (
                paginatedQuotations.map((q) => {
                  const cust = customers.find((c) => c.id === q.customerId);

                  return (
                    <tr
                      key={q.id}
                      onClick={() => setSelectedQuotation(q)}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {q.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{cust?.companyName}</div>
                        <div className="text-[10px] text-slate-400">
                          PIC: {cust?.fullName} ({cust?.id})
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {formatDate(q.date)}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800 whitespace-nowrap">
                        {formatBandwidth(q.bandwidthMbps)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatRupiah(q.total)}
                        <span className="block text-[10px] text-slate-400 font-normal font-sans">
                          DPP: {formatRupiah(q.dpp)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {formatDate(q.validUntil)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <QuotationStatusBadge status={q.status} />
                      </td>
                      <td
                        className="py-3 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedQuotation(q)}
                            title="Lihat Pratinjau Dokumen"
                            className="p-1.5 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {q.status === 'Accepted' && (
                            <button
                              onClick={() => handleConvertToInvoice(q.id)}
                              title="Terbitkan Faktur dari Penawaran Ini"
                              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-semibold text-[11px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                            >
                              <FileCheck className="w-3 h-3 text-emerald-400" />
                              <span>Ke Faktur</span>
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
              {filteredQuotations.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{' '}
            -{' '}
            <span className="font-semibold text-slate-900">
              {Math.min(currentPage * itemsPerPage, filteredQuotations.length)}
            </span>{' '}
            dari <span className="font-semibold text-slate-900">{filteredQuotations.length}</span> penawaran
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

      {/* Quotation Preview Modal */}
      <QuotationPreviewModal
        quotation={selectedQuotation}
        onClose={() => setSelectedQuotation(null)}
        onConvertToInvoice={handleConvertToInvoice}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};
