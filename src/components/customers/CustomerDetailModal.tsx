import React, { useState } from 'react';
import { Customer } from '../../types';
import { useApp } from '../../context/AppContext';
import { CustomerStatusBadge, QuotationStatusBadge, InvoiceStatusBadge } from '../common/Badge';
import { formatRupiah, formatBandwidth, formatDate } from '../../utils/formatters';
import {
  X,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Receipt,
  Wifi,
  Plus,
  ArrowUpRight,
} from 'lucide-react';

interface CustomerDetailModalProps {
  customer: Customer | null;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  onClose,
  onEdit,
}) => {
  const { services, quotations, invoices, metro, publicIps, setActiveMenu } = useApp();
  const [activeTab, setActiveTab] = useState<'info' | 'services' | 'quotations' | 'invoices'>('info');

  if (!customer) return null;

  const customerServices = services.filter((s) => s.customerId === customer.id);
  const customerQuotations = quotations.filter((q) => q.customerId === customer.id);
  const customerInvoices = invoices.filter((i) => i.customerId === customer.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-300 font-bold text-lg flex-shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {customer.companyName}
                </h2>
                <CustomerStatusBadge status={customer.status} />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-teal-300">
                  {customer.id}
                </span>
                <span>PIC: {customer.fullName} ({customer.picPosition || 'Penanggung Jawab'})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(customer)}
              className="px-3 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors cursor-pointer"
            >
              Edit Data
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'info'
                ? 'border-teal-700 text-teal-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Profil & Kontak
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'services'
                ? 'border-teal-700 text-teal-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wifi className="w-4 h-4" />
            Layanan ({customerServices.length})
          </button>
          <button
            onClick={() => setActiveTab('quotations')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'quotations'
                ? 'border-teal-700 text-teal-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Quotation ({customerQuotations.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'invoices'
                ? 'border-teal-700 text-teal-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Invoice ({customerInvoices.length})
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 max-h-[calc(90vh-180px)]">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box 1: Informasi Personal */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 text-slate-800 font-bold text-sm">
                  <User className="w-4 h-4 text-teal-700" />
                  Informasi Personal (PIC)
                </div>
                <dl className="space-y-3 text-xs">
                  <div>
                    <dt className="text-slate-500">Nama Lengkap PIC</dt>
                    <dd className="font-semibold text-slate-800 text-sm">{customer.fullName}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">NIK / KTP</dt>
                    <dd className="font-mono text-slate-700">{customer.nik || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Jabatan PIC</dt>
                    <dd className="text-slate-700">{customer.picPosition || '-'}</dd>
                  </div>
                </dl>
              </div>

              {/* Box 2: Informasi Perusahaan */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 text-slate-800 font-bold text-sm">
                  <Building2 className="w-4 h-4 text-teal-700" />
                  Informasi Perusahaan
                </div>
                <dl className="space-y-3 text-xs">
                  <div>
                    <dt className="text-slate-500">Nama Badan Usaha / Perusahaan</dt>
                    <dd className="font-semibold text-slate-800 text-sm">{customer.companyName}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">NPWP Perusahaan</dt>
                    <dd className="font-mono text-slate-700">{customer.npwp || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Nomor Induk Berusaha (NIB)</dt>
                    <dd className="font-mono text-slate-700">{customer.nib || '-'}</dd>
                  </div>
                </dl>
              </div>

              {/* Box 3: Kontak */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 text-slate-800 font-bold text-sm">
                  <Phone className="w-4 h-4 text-teal-700" />
                  Kontak PIC & Operasional
                </div>
                <dl className="space-y-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <div>
                      <dt className="text-slate-500">WhatsApp / Telepon</dt>
                      <dd className="font-semibold text-slate-800">{customer.whatsapp}</dd>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-sky-600" />
                    <div>
                      <dt className="text-slate-500">Email Resmi</dt>
                      <dd className="font-semibold text-slate-800">{customer.email}</dd>
                    </div>
                  </div>
                </dl>
              </div>

              {/* Box 4: Alamat */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 text-slate-800 font-bold text-sm">
                  <MapPin className="w-4 h-4 text-teal-700" />
                  Alamat Pemasangan / Kantor
                </div>
                <dl className="space-y-3 text-xs">
                  <div>
                    <dt className="text-slate-500">Alamat Lengkap</dt>
                    <dd className="text-slate-800 leading-relaxed">{customer.address}</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div>
                      <dt className="text-slate-500">Kota</dt>
                      <dd className="font-medium text-slate-800">{customer.city || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Provinsi</dt>
                      <dd className="font-medium text-slate-800">{customer.province || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Kode Pos</dt>
                      <dd className="font-mono text-slate-800">{customer.postalCode || '-'}</dd>
                    </div>
                  </div>
                </dl>
              </div>

              {customer.notes && (
                <div className="md:col-span-2 bg-amber-50/60 p-4 rounded-xl border border-amber-200 text-xs">
                  <p className="font-bold text-amber-900 mb-1">Catatan Tambahan Pelanggan:</p>
                  <p className="text-amber-800">{customer.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">
                  Daftar Layanan ISP Aktif ({customerServices.length})
                </h3>
                <button
                  onClick={() => {
                    onClose();
                    setActiveMenu('create-service');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Buat Layanan Baru
                </button>
              </div>

              {customerServices.length === 0 ? (
                <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Wifi className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Belum ada layanan aktif untuk pelanggan ini.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customerServices.map((svc) => {
                    const mObj = metro.find((m) => m.id === svc.metroId);
                    const ipObj = publicIps.find((p) => p.id === svc.publicIpId);

                    return (
                      <div
                        key={svc.id}
                        className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-teal-800">
                              {svc.id}
                            </span>
                            <span className="text-sm font-bold text-slate-900">
                              {formatBandwidth(svc.bandwidthMbps)} Dedicated
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-medium">
                              {svc.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-3">
                            <span>Metro: {mObj?.name || '-'}</span>
                            <span>•</span>
                            <span>Public IP: {ipObj?.prefix || 'Tanpa IP'}</span>
                            {svc.notes && (
                              <>
                                <span>•</span>
                                <span className="italic">{svc.notes}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
                          <p className="text-xs text-slate-400">Total Bulanan (inc. PPN)</p>
                          <p className="text-base font-bold text-teal-700">
                            {formatRupiah(svc.totalMonthly)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'quotations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">
                  Daftar Penawaran / Quotation ({customerQuotations.length})
                </h3>
              </div>

              {customerQuotations.length === 0 ? (
                <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Belum ada quotation dibuat untuk pelanggan ini.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                  {customerQuotations.map((q) => (
                    <div
                      key={q.id}
                      className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-800">{q.id}</span>
                          <QuotationStatusBadge status={q.status} />
                          <span className="text-slate-400">Tanggal: {formatDate(q.date)}</span>
                        </div>
                        <p className="text-slate-600 mt-1">
                          Bandwidth: {formatBandwidth(q.bandwidthMbps)} • Valid s/d: {formatDate(q.validUntil)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm text-slate-900 block">
                          {formatRupiah(q.total)}
                        </span>
                        <span className="text-[10px] text-slate-400">Sudah termasuk PPN 11%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">
                  Histori Tagihan & Invoice ({customerInvoices.length})
                </h3>
              </div>

              {customerInvoices.length === 0 ? (
                <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Belum ada invoice diterbitkan untuk pelanggan ini.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                  {customerInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-800">{inv.id}</span>
                          <InvoiceStatusBadge status={inv.paymentStatus} />
                          <span className="text-slate-500 font-medium">Periode: {inv.billingPeriod}</span>
                        </div>
                        <p className="text-slate-600 mt-1">{inv.serviceDescription}</p>
                        <p className="text-[11px] text-slate-400">
                          Jatuh tempo: {formatDate(inv.dueDate)} • Terbayar: {formatRupiah(inv.paidAmount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm text-slate-900 block">
                          {formatRupiah(inv.total)}
                        </span>
                        {inv.paidAmount < inv.total && (
                          <span className="text-[11px] text-rose-600 font-medium">
                            Kurang: {formatRupiah(inv.total - inv.paidAmount)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
