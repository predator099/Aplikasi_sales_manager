import React from 'react';
import { Quotation } from '../../types';
import { useApp } from '../../context/AppContext';
import { QuotationStatusBadge } from '../common/Badge';
import { formatRupiah, formatBandwidth, formatDate } from '../../utils/formatters';
import {
  X,
  Printer,
  FileCheck,
  Building2,
  Mail,
  Phone,
  Radio,
  Download,
  Calendar,
  ShieldCheck,
} from 'lucide-react';

interface QuotationPreviewModalProps {
  quotation: Quotation | null;
  onClose: () => void;
  onConvertToInvoice: (quotationId: string) => void;
  onStatusChange: (status: Quotation['status']) => void;
}

export const QuotationPreviewModal: React.FC<QuotationPreviewModalProps> = ({
  quotation,
  onClose,
  onConvertToInvoice,
  onStatusChange,
}) => {
  const { customers, metro, publicIps } = useApp();

  if (!quotation) return null;

  const customer = customers.find((c) => c.id === quotation.customerId);
  const metroObj = metro.find((m) => m.id === quotation.metroId);
  const ipObj = publicIps.find((p) => p.id === quotation.publicIpId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-6 shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[92vh]">
        {/* Top Control Bar */}
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-slate-800 text-teal-300 px-2 py-0.5 rounded">
              {quotation.id}
            </span>
            <QuotationStatusBadge status={quotation.status} />
          </div>

          <div className="flex items-center gap-2">
            {quotation.status === 'Accepted' && (
              <button
                onClick={() => onConvertToInvoice(quotation.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Terbitkan Invoice</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-10 overflow-y-auto flex-1 bg-white text-slate-800 printable-area">
          {/* Company & Document Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-base tracking-wider text-slate-900 block font-sans">
                    ANTEN BUSINESS MANAGER
                  </span>
                  <span className="text-[10px] font-semibold tracking-widest text-teal-700 uppercase">
                    PT Anten Sarana Teknologi
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 max-w-sm mt-2 leading-relaxed">
                Cyber Building 2 Floor 15, Jl. H.R. Rasuna Said, Kuningan, Jakarta Selatan 12950<br />
                Email: sales@anten.net.id | Hotline: +62 21 555-ANTEN
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs uppercase font-bold tracking-wider text-teal-800 bg-teal-50 px-3 py-1 rounded-md inline-block mb-2">
                OFFICIAL QUOTATION
              </span>
              <p className="text-lg font-bold font-mono text-slate-900">{quotation.id}</p>
              <p className="text-xs text-slate-500 mt-1">
                Tanggal Terbit: <span className="font-semibold text-slate-700">{formatDate(quotation.date)}</span>
              </p>
              <p className="text-xs text-slate-500">
                Masa Berlaku: <span className="font-semibold text-slate-700">{formatDate(quotation.validUntil)}</span>
              </p>
            </div>
          </div>

          {/* Customer Destination Box */}
          <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Ditujukan Kepada Klien:
              </span>
              <p className="text-sm font-bold text-slate-900">{customer?.companyName}</p>
              <p className="text-slate-700 mt-0.5">U.p. : {customer?.fullName} ({customer?.picPosition || 'PIC'})</p>
              <p className="text-slate-600 mt-1 leading-relaxed">{customer?.address}, {customer?.city}</p>
              <p className="text-slate-500 mt-0.5">WhatsApp: {customer?.whatsapp} | Email: {customer?.email}</p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Identitas Legal Klien:
              </span>
              <p className="text-slate-600">NPWP: <span className="font-mono font-medium text-slate-800">{customer?.npwp || '-'}</span></p>
              <p className="text-slate-600">NIB: <span className="font-mono font-medium text-slate-800">{customer?.nib || '-'}</span></p>
              <p className="text-slate-600">Customer ID: <span className="font-mono font-medium text-teal-800">{customer?.id}</span></p>
            </div>
          </div>

          {/* Service Items Table */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Rincian Layanan ISP & Spesifikasi Link
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-4">Item & Spesifikasi</th>
                    <th className="py-2.5 px-4">Parameter</th>
                    <th className="py-2.5 px-4 text-right">Biaya Bulanan (IDR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      Dedicated Internet Bandwidth
                      <span className="block text-[11px] text-slate-500 font-normal">
                        Kapasitas CIR 1:1, Port SFP Fiber Optic, SLA 99.8%
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-teal-800">
                      {formatBandwidth(quotation.bandwidthMbps)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-800">
                      {formatRupiah(quotation.internetCost)}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      Local Loop Metro Ethernet
                      <span className="block text-[11px] text-slate-500 font-normal">
                        Koneksi link backbone ke titik PoP terdekat
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {metroObj?.name || 'Metro Link'} ({metroObj?.priceMethod})
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-800">
                      {formatRupiah(quotation.metroCost)}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      Alokasi Public IPv4 Address
                      <span className="block text-[11px] text-slate-500 font-normal">
                        Subnet IP publik statis untuk server & routing korporat
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      Prefix {ipObj?.prefix || 'Tanpa IP'}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-800">
                      {formatRupiah(quotation.publicIpCost)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Math Summary */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2">
            <div className="max-w-xs text-[11px] text-slate-500 space-y-2">
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Syarat & Ketentuan Penawaran:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Harga berlaku selama masa penawaran s/d {formatDate(quotation.validUntil)}.</li>
                <li>Termasuk fasilitas MRTG monitoring dan support 24/7/365 NOC.</li>
                <li>Pembayaran tagihan rutin per bulan jatuh tempo 14 hari kalender.</li>
              </ul>
            </div>

            <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Layanan:</span>
                <span className="font-medium text-slate-800">{formatRupiah(quotation.subtotal)}</span>
              </div>

              {quotation.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Diskon Khusus:</span>
                  <span>- {formatRupiah(quotation.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-200">
                <span>DPP (Dasar Pengenaan Pajak):</span>
                <span>{formatRupiah(quotation.dpp)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>PPN 11%:</span>
                <span className="text-amber-700 font-semibold">{formatRupiah(quotation.ppnAmount)}</span>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-slate-300 font-bold text-sm text-teal-900">
                <span>Total Investasi / Bulan:</span>
                <span className="text-base">{formatRupiah(quotation.total)}</span>
              </div>
            </div>
          </div>

          {/* Internal Margin & Fee Allocation Breakdown (Internal Reference, Print Hidden) */}
          {quotation.pricingAllocation && (
            <div className="mt-8 p-4 bg-slate-900 text-white rounded-xl border border-slate-800 text-xs space-y-3 print:hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-teal-300 uppercase tracking-wider text-[11px]">
                  Rincian Alokasi Margin Internal ISP (Formula Paten)
                </span>
                <span className="text-emerald-400 font-bold font-mono">
                  Margin: {formatRupiah(quotation.pricingAllocation.margin)}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 bg-slate-800 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Kantor (ISP)</span>
                  <span className="font-bold font-mono text-white">{formatRupiah(quotation.pricingAllocation.kantor.amount)}</span>
                  <span className="text-[10px] text-teal-400 block">60% dari Margin</span>
                </div>
                <div className="p-2 bg-teal-950 rounded-lg border border-teal-800">
                  <span className="text-teal-300 block text-[10px]">Pool Marketing</span>
                  <span className="font-bold font-mono text-teal-300">{formatRupiah(quotation.pricingAllocation.marketingPool.amount)}</span>
                  <span className="text-[10px] text-teal-400 block">40% dari Margin</span>
                </div>
                <div className="p-2 bg-slate-800 rounded-lg">
                  <span className="text-amber-300 block text-[10px]">Sales</span>
                  <span className="font-bold font-mono text-amber-300">{formatRupiah(quotation.pricingAllocation.sales.amount)}</span>
                  <span className="text-[10px] text-slate-400 block">75% Pool (30% Margin)</span>
                </div>
                <div className="p-2 bg-slate-800 rounded-lg">
                  <span className="text-purple-300 block text-[10px]">AM</span>
                  <span className="font-bold font-mono text-purple-300">{formatRupiah(quotation.pricingAllocation.am.amount)}</span>
                  <span className="text-[10px] text-slate-400 block">25% Pool (10% Margin)</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex justify-between">
                <span>Formula Fixed: Kantor 60% • Pool Marketing 40% (Sales 75% : AM 25%)</span>
                <span className="text-emerald-400 font-mono">Valid: 100% Margin Teralokasi</span>
              </div>
            </div>
          )}

          {/* Signature Block */}
          <div className="grid grid-cols-2 gap-8 mt-10 pt-6 border-t border-slate-200 text-center text-xs">
            <div>
              <p className="text-slate-500 mb-12">Disiapkan Oleh, PT Anten Sarana Teknologi</p>
              <p className="font-bold text-slate-900 border-t border-slate-400 pt-1 inline-block min-w-[160px]">
                Sales & Enterprise Div.
              </p>
            </div>
            <div>
              <p className="text-slate-500 mb-12">Disetujui Oleh Klien / Pelanggan,</p>
              <p className="font-bold text-slate-900 border-t border-slate-400 pt-1 inline-block min-w-[160px]">
                {customer?.fullName || 'Tanda Tangan & Cap'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Status Switcher */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-600">Ubah Status Quotation:</span>
            <select
              value={quotation.status}
              onChange={(e) => onStatusChange(e.target.value as Quotation['status'])}
              className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="Draft">Draft</option>
              <option value="Sent">Sent (Terkirim)</option>
              <option value="Accepted">Accepted (Disetujui)</option>
              <option value="Rejected">Rejected (Ditolak)</option>
              <option value="Expired">Expired (Kadaluarsa)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
