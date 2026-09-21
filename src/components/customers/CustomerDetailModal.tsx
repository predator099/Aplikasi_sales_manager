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
  Download,
  Calendar,
  Briefcase,
  ShieldCheck,
  Headphones,
  CheckCircle2,
  AlertCircle,
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
  const [activeTab, setActiveTab] = useState<'info' | 'documents' | 'services' | 'quotations' | 'invoices'>('info');

  if (!customer) return null;

  const customerServices = services.filter((s) => s.customerId === customer.id);
  const customerQuotations = quotations.filter((q) => q.customerId === customer.id);
  const customerInvoices = invoices.filter((i) => i.customerId === customer.id);

  const handleDownloadDoc = (fileData?: string, fileName?: string) => {
    if (fileData) {
      const link = document.createElement('a');
      link.href = fileData;
      link.download = fileName || 'dokumen';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`Berkas lampiran: ${fileName || 'Dokumen'}`);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
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
                <span className="text-teal-400 font-medium">• {customer.subscriptionPeriod || '12 Bulan'}</span>
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
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-teal-700 text-teal-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Profil & Organisasi
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'documents'
                ? 'border-teal-700 text-teal-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Lampiran NPWP & NIB
            {(customer.npwpDocument || customer.nibDocument) && (
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
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
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
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
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
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
        <div className="p-6 overflow-y-auto flex-1 max-h-[calc(92vh-180px)]">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Box 1: Penanggung Jawab & Legalitas Perusahaan */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 text-slate-800 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  Penanggung Jawab & Kontrak
                </div>
                <dl className="space-y-3 text-xs">
                  <div>
                    <dt className="text-slate-500">Penanggung Jawab Utama</dt>
                    <dd className="font-semibold text-slate-900 text-sm">
                      {customer.responsiblePerson || customer.fullName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Nomor Telpon Penanggung Jawab</dt>
                    <dd className="font-mono text-slate-800 font-medium">
                      {customer.responsiblePersonPhone || customer.whatsapp || '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Jangka Waktu Berlangganan</dt>
                    <dd className="inline-flex items-center gap-1.5 font-semibold text-teal-800 mt-0.5 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      <Calendar className="w-3.5 h-3.5" />
                      {customer.subscriptionPeriod || '12 Bulan (1 Tahun)'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Box 2: Sales Representatif */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 text-slate-800 font-bold text-sm">
                  <Briefcase className="w-4 h-4 text-teal-700" />
                  Account Executive (Sales)
                </div>
                <dl className="space-y-3 text-xs">
                  <div>
                    <dt className="text-slate-500">Nama Sales Representatif</dt>
                    <dd className="font-semibold text-slate-900 text-sm">
                      {customer.salesName || 'Rian Pratama'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Nomor Telpon Sales</dt>
                    <dd className="font-mono text-slate-800 font-medium">
                      {customer.salesPhone || '081298765432'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Status Akun Pelanggan</dt>
                    <dd className="mt-1">
                      <CustomerStatusBadge status={customer.status} />
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Box 3: PIC Teknis & PIC Keuangan */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 text-slate-800 font-bold text-sm">
                  <Headphones className="w-4 h-4 text-teal-700" />
                  Kontak Operasional & Finance
                </div>
                <dl className="space-y-3 text-xs">
                  <div>
                    <dt className="text-slate-500">Nomor PIC Teknis (NOC / Admin Link)</dt>
                    <dd className="font-mono font-semibold text-slate-900 text-sm">
                      {customer.picTechnicalPhone || '-'}
                    </dd>
                  </div>
                  <div className="pt-2 border-t border-slate-200/80">
                    <dt className="text-slate-500">Nama PIC Keuangan</dt>
                    <dd className="font-semibold text-slate-800">
                      {customer.picFinanceName || '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Nomor PIC Keuangan</dt>
                    <dd className="font-mono text-slate-800 font-medium">
                      {customer.picFinancePhone || '-'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Box 4: PIC Utama & Kontak Komunikasi */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 text-slate-800 font-bold text-sm">
                  <User className="w-4 h-4 text-teal-700" />
                  PIC Utama & Alamat Tagihan
                </div>
                <dl className="space-y-3 text-xs">
                  <div>
                    <dt className="text-slate-500">Nama PIC Utama</dt>
                    <dd className="font-semibold text-slate-800">
                      {customer.fullName} ({customer.picPosition || 'PIC'})
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">WhatsApp PIC Utama</dt>
                    <dd className="font-mono text-slate-800 font-medium">{customer.whatsapp}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Email Resmi / Tagihan</dt>
                    <dd className="font-semibold text-slate-800">{customer.email}</dd>
                  </div>
                </dl>
              </div>

              {/* Box 5: Alamat Pemasangan */}
              <div className="md:col-span-2 bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200 text-slate-800 font-bold text-sm">
                  <MapPin className="w-4 h-4 text-teal-700" />
                  Alamat Pemasangan & Ruang Server
                </div>
                <dl className="space-y-3 text-xs">
                  <div>
                    <dt className="text-slate-500">Alamat Lengkap</dt>
                    <dd className="text-slate-800 leading-relaxed font-medium">
                      {customer.address}
                    </dd>
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
                <div className="md:col-span-2 bg-amber-50/70 p-4 rounded-xl border border-amber-200 text-xs">
                  <p className="font-bold text-amber-900 mb-1">Catatan Tambahan Pelanggan:</p>
                  <p className="text-amber-800">{customer.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Tab Documents: Lampiran NPWP & NIB */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="bg-teal-50/60 p-4 rounded-xl border border-teal-100 flex items-start gap-3">
                <FileText className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-teal-950">
                    Dokumen Legalitas Terlampir (NPWP & NIB)
                  </h4>
                  <p className="text-xs text-teal-800/80 mt-0.5">
                    Dokumen ini digunakan untuk verifikasi kepatuhan hukum ISP, penerbitan Faktur Pajak elektronik, dan perjanjian SLA berlangganan.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Dokumen NPWP Card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Dokumen NPWP</h4>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Nomor: {customer.npwp || 'Belum diisi'}
                        </p>
                      </div>
                    </div>
                    {customer.npwpDocument ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Terlampir
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <AlertCircle className="w-3 h-3" /> Belum Diunggah
                      </span>
                    )}
                  </div>

                  {customer.npwpDocument ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate" title={customer.npwpDocument.name}>
                            {customer.npwpDocument.name}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {formatFileSize(customer.npwpDocument.size)}
                            {customer.npwpDocument.uploadedAt && ` • ${formatDate(customer.npwpDocument.uploadedAt)}`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDownloadDoc(customer.npwpDocument?.fileData, customer.npwpDocument?.name)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" /> Unduh
                        </button>
                      </div>

                      {/* Document Preview Thumbnail if available */}
                      {customer.npwpDocument.fileData && customer.npwpDocument.fileData.startsWith('data:image/') && (
                        <div className="border border-slate-200 rounded-lg overflow-hidden max-h-48 bg-slate-100 flex items-center justify-center">
                          <img
                            src={customer.npwpDocument.fileData}
                            alt="Preview NPWP"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg">
                      <p className="text-xs text-slate-500">Tidak ada lampiran berkas NPWP.</p>
                      <button
                        onClick={() => onEdit(customer)}
                        className="mt-2 text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
                      >
                        Unggah Dokumen NPWP
                      </button>
                    </div>
                  )}
                </div>

                {/* Dokumen NIB Card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Dokumen NIB</h4>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Nomor: {customer.nib || 'Belum diisi'}
                        </p>
                      </div>
                    </div>
                    {customer.nibDocument ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Terlampir
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <AlertCircle className="w-3 h-3" /> Belum Diunggah
                      </span>
                    )}
                  </div>

                  {customer.nibDocument ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate" title={customer.nibDocument.name}>
                            {customer.nibDocument.name}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {formatFileSize(customer.nibDocument.size)}
                            {customer.nibDocument.uploadedAt && ` • ${formatDate(customer.nibDocument.uploadedAt)}`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDownloadDoc(customer.nibDocument?.fileData, customer.nibDocument?.name)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" /> Unduh
                        </button>
                      </div>

                      {/* Document Preview Thumbnail if available */}
                      {customer.nibDocument.fileData && customer.nibDocument.fileData.startsWith('data:image/') && (
                        <div className="border border-slate-200 rounded-lg overflow-hidden max-h-48 bg-slate-100 flex items-center justify-center">
                          <img
                            src={customer.nibDocument.fileData}
                            alt="Preview NIB"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg">
                      <p className="text-xs text-slate-500">Tidak ada lampiran berkas NIB.</p>
                      <button
                        onClick={() => onEdit(customer)}
                        className="mt-2 text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
                      >
                        Unggah Dokumen NIB
                      </button>
                    </div>
                  )}
                </div>
              </div>
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
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Layanan
                </button>
              </div>

              {customerServices.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 text-slate-400">
                  <Wifi className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-medium">Pelanggan ini belum memiliki layanan terdaftar.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customerServices.map((srv) => (
                    <div
                      key={srv.id}
                      className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            {srv.id}
                          </span>
                          <span className="font-semibold text-slate-800 text-sm">
                            Internet Dedicated
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-600">
                            {formatBandwidth(srv.bandwidthMbps)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Dibuat: {formatDate(srv.createdAt)} {srv.notes ? `• ${srv.notes}` : ''}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">
                          {formatRupiah(srv.totalMonthly)}
                          <span className="text-[10px] text-slate-400 font-normal"> /bulan</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {srv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'quotations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">
                  Riwayat Quotation ({customerQuotations.length})
                </h3>
                <button
                  onClick={() => {
                    onClose();
                    setActiveMenu('quotations');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Buat Quotation
                </button>
              </div>

              {customerQuotations.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 text-slate-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-medium">Belum ada penawaran harga untuk pelanggan ini.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {customerQuotations.map((q) => (
                    <div key={q.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-800">{q.id}</span>
                          <QuotationStatusBadge status={q.status} />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Dibuat: {formatDate(q.createdAt)} • Jatuh tempo: {formatDate(q.validUntil)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">{formatRupiah(q.total)}</div>
                        <button
                          onClick={() => {
                            onClose();
                            setActiveMenu('quotations');
                          }}
                          className="text-xs text-teal-700 hover:underline flex items-center gap-0.5 justify-end mt-1 cursor-pointer"
                        >
                          Buka di Quotation <ArrowUpRight className="w-3 h-3" />
                        </button>
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
                  Daftar Tagihan & Invoice ({customerInvoices.length})
                </h3>
                <button
                  onClick={() => {
                    onClose();
                    setActiveMenu('invoices');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Buka Menu Billing
                </button>
              </div>

              {customerInvoices.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 text-slate-400">
                  <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-medium">Belum ada invoice yang diterbitkan untuk pelanggan ini.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {customerInvoices.map((inv) => (
                    <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-800">{inv.id}</span>
                          <InvoiceStatusBadge status={inv.paymentStatus} />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Periode: {inv.billingPeriod} • Jatuh Tempo: {formatDate(inv.dueDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">{formatRupiah(inv.total)}</div>
                        <button
                          onClick={() => {
                            onClose();
                            setActiveMenu('invoices');
                          }}
                          className="text-xs text-teal-700 hover:underline flex items-center gap-0.5 justify-end mt-1 cursor-pointer"
                        >
                          Kelola Tagihan <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
