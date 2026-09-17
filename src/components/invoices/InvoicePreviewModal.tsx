import React from 'react';
import { Invoice } from '../../types';
import { useApp } from '../../context/AppContext';
import { InvoiceStatusBadge } from '../common/Badge';
import { formatRupiah, formatDate } from '../../utils/formatters';
import {
  X,
  Printer,
  Radio,
  Building2,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface InvoicePreviewModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onOpenPaymentModal: (invoice: Invoice) => void;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  invoice,
  onClose,
  onOpenPaymentModal,
}) => {
  const { customers, services } = useApp();

  if (!invoice) return null;

  const customer = customers.find((c) => c.id === invoice.customerId);
  const service = services.find((s) => s.id === invoice.serviceId);

  const handlePrint = () => {
    window.print();
  };

  const isFullyPaid = invoice.paymentStatus === 'Paid';
  const remaining = Math.max(0, invoice.total - invoice.paidAmount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-6 shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[92vh]">
        {/* Top Bar */}
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-slate-800 text-teal-300 px-2 py-0.5 rounded">
              {invoice.id}
            </span>
            <InvoiceStatusBadge status={invoice.paymentStatus} />
          </div>

          <div className="flex items-center gap-2">
            {!isFullyPaid && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPaymentModal(invoice);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Catat Pembayaran</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Cetak PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document */}
        <div className="p-8 sm:p-10 overflow-y-auto flex-1 bg-white text-slate-800 relative">
          {/* Watermark/Stamp if Paid */}
          {isFullyPaid && (
            <div className="absolute right-12 top-48 border-4 border-emerald-600 text-emerald-600 font-extrabold text-2xl uppercase tracking-widest px-6 py-2 rounded-xl rotate-[-12deg] opacity-75 pointer-events-none select-none">
              LUNAS / PAID
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-base tracking-wider text-slate-900 block">
                    ANTEN BUSINESS MANAGER
                  </span>
                  <span className="text-[10px] font-semibold tracking-widest text-teal-700 uppercase">
                    PT Anten Sarana Teknologi
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 max-w-sm mt-2 leading-relaxed">
                Cyber Building 2 Floor 15, Jl. H.R. Rasuna Said, Kuningan, Jakarta Selatan 12950<br />
                NPWP: 01.345.678.9-014.000 | Finance: billing@anten.net.id
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs uppercase font-bold tracking-wider text-teal-900 bg-teal-50 px-3 py-1 rounded-md inline-block mb-2">
                FAKTUR TAGIHAN / INVOICE
              </span>
              <p className="text-lg font-bold font-mono text-slate-900">{invoice.id}</p>
              <p className="text-xs text-slate-500 mt-1">
                Periode Layanan: <span className="font-semibold text-slate-800">{invoice.billingPeriod}</span>
              </p>
              <p className="text-xs text-slate-500">
                Tanggal Tagihan: <span className="font-semibold text-slate-700">{formatDate(invoice.issueDate)}</span>
              </p>
              <p className="text-xs text-rose-600 font-medium">
                Jatuh Tempo: <span className="font-bold">{formatDate(invoice.dueDate)}</span>
              </p>
            </div>
          </div>

          {/* Customer info */}
          <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Tagihan Ditujukan Kepada:
              </span>
              <p className="text-sm font-bold text-slate-900">{customer?.companyName}</p>
              <p className="text-slate-700 mt-0.5">U.p.: {customer?.fullName} ({customer?.picPosition || 'PIC'})</p>
              <p className="text-slate-600 mt-1 leading-relaxed">{customer?.address}, {customer?.city}</p>
              <p className="text-slate-500 mt-0.5">Email Billing: {customer?.email}</p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Legalitas Pelanggan:
              </span>
              <p className="text-slate-600">NPWP: <span className="font-mono font-medium text-slate-800">{customer?.npwp || '-'}</span></p>
              <p className="text-slate-600">NIB: <span className="font-mono font-medium text-slate-800">{customer?.nib || '-'}</span></p>
              <p className="text-slate-600">Customer ID: <span className="font-mono font-medium text-teal-800">{customer?.id}</span></p>
              <p className="text-slate-600">Service ID: <span className="font-mono font-medium text-slate-800">{invoice.serviceId}</span></p>
            </div>
          </div>

          {/* Items Breakdown Table */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Rincian Tagihan Layanan
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-4">Deskripsi Layanan</th>
                    <th className="py-2.5 px-4">Periode</th>
                    <th className="py-2.5 px-4 text-right">Jumlah (IDR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {invoice.serviceDescription}
                      <span className="block text-[11px] text-slate-500 font-normal">
                        Langganan Dedicated Internet + Local Loop Metro-E + Public IP
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {invoice.billingPeriod}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">
                      {formatRupiah(invoice.subtotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Math Summary */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2">
            <div className="max-w-sm text-xs space-y-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Informasi Rekening Pembayaran Resmi:
                </span>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-900">Bank Central Asia (BCA):</span>
                    <span className="font-mono font-bold text-teal-800">800-988-1234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-900">Bank Mandiri:</span>
                    <span className="font-mono font-bold text-teal-800">137-00-9988-771</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                    Atas Nama: <span className="font-bold text-slate-800">PT Anten Sarana Teknologi</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-medium text-slate-800">{formatRupiah(invoice.subtotal)}</span>
              </div>

              <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-200">
                <span>DPP (Dasar Pengenaan Pajak):</span>
                <span>{formatRupiah(invoice.dpp)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>PPN 11%:</span>
                <span className="text-amber-700 font-semibold">{formatRupiah(invoice.ppnAmount)}</span>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-slate-300 font-bold text-sm text-slate-900">
                <span>Total Tagihan:</span>
                <span className="text-base text-teal-900">{formatRupiah(invoice.total)}</span>
              </div>

              <div className="flex justify-between text-emerald-700 font-semibold pt-1 border-t border-slate-200">
                <span>Jumlah Dibayar:</span>
                <span>{formatRupiah(invoice.paidAmount)}</span>
              </div>

              <div className="flex justify-between font-bold text-rose-700 pt-1 border-t border-slate-200">
                <span>Sisa Pembayaran:</span>
                <span>{formatRupiah(remaining)}</span>
              </div>
            </div>
          </div>

          {/* Payment Log History */}
          {invoice.paymentHistory && invoice.paymentHistory.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Histori Penerimaan Pembayaran
              </h5>
              <div className="space-y-1.5">
                {invoice.paymentHistory.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-100 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="font-bold text-slate-900">{formatRupiah(p.amount)}</span>
                        <span className="text-slate-500 ml-2">via {p.method}</span>
                        {p.notes && <span className="text-slate-400 ml-2 italic">({p.notes})</span>}
                      </div>
                    </div>
                    <span className="text-slate-500">{formatDate(p.date)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Signature */}
          <div className="grid grid-cols-2 gap-8 mt-10 pt-6 border-t border-slate-200 text-center text-xs">
            <div>
              <p className="text-slate-500 mb-12">Diterbitkan Oleh, Finance & Billing</p>
              <p className="font-bold text-slate-900 border-t border-slate-400 pt-1 inline-block min-w-[160px]">
                PT Anten Sarana Teknologi
              </p>
            </div>
            <div>
              <p className="text-slate-500 mb-12">Klien Penerima Faktur,</p>
              <p className="font-bold text-slate-900 border-t border-slate-400 pt-1 inline-block min-w-[160px]">
                {customer?.companyName || 'Finance Dept'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
