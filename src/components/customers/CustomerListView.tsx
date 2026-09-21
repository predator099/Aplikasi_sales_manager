import React, { useState, useMemo } from 'react';
import { Customer } from '../../types';
import { useApp } from '../../context/AppContext';
import { CustomerStatusBadge } from '../common/Badge';
import { CustomerFormModal } from './CustomerFormModal';
import { CustomerDetailModal } from './CustomerDetailModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  Building2,
  FileCheck,
  Calendar,
  Phone,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';

export const CustomerListView: React.FC = () => {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    selectedCustomerIdForDetail,
    openCustomerDetail,
    closeCustomerDetail,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  // Status toggle confirmation
  const [confirmTarget, setConfirmTarget] = useState<Customer | null>(null);

  // Detail modal customer selection
  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerIdForDetail) || null;
  }, [customers, selectedCustomerIdForDetail]);

  // Filtered & Searched data
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return customers.filter((c) => {
      const matchSearch =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.fullName.toLowerCase().includes(q) ||
        c.companyName.toLowerCase().includes(q) ||
        c.whatsapp.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.salesName && c.salesName.toLowerCase().includes(q)) ||
        (c.salesPhone && c.salesPhone.includes(q)) ||
        (c.responsiblePerson && c.responsiblePerson.toLowerCase().includes(q)) ||
        (c.picFinanceName && c.picFinanceName.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [customers, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / itemsPerPage));
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(start, start + itemsPerPage);
  }, [filteredCustomers, currentPage]);

  const handleCreateCustomer = (data: Omit<Customer, 'id' | 'createdAt'>) => {
    addCustomer(data);
  };

  const handleUpdateCustomer = (data: Omit<Customer, 'id' | 'createdAt'>) => {
    if (customerToEdit) {
      updateCustomer(customerToEdit.id, data);
      setCustomerToEdit(null);
    }
  };

  const toggleStatus = (customer: Customer) => {
    const nextStatus = customer.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif';
    updateCustomer(customer.id, { status: nextStatus });
  };

  // Export to CSV helper
  const handleExportCSV = () => {
    const headers = [
      'Customer ID',
      'Perusahaan',
      'PIC Utama',
      'WhatsApp PIC',
      'Email',
      'Sales',
      'No Telpon Sales',
      'No PIC Teknis',
      'PIC Keuangan',
      'No PIC Keuangan',
      'Jangka Waktu Berlangganan',
      'Penanggung Jawab',
      'No Penanggung Jawab',
      'NPWP',
      'Lampiran NPWP',
      'NIB',
      'Lampiran NIB',
      'Status',
    ];

    const rows = filteredCustomers.map((c) => [
      `"${c.id}"`,
      `"${c.companyName}"`,
      `"${c.fullName}"`,
      `"${c.whatsapp}"`,
      `"${c.email}"`,
      `"${c.salesName || '-'}"`,
      `"${c.salesPhone || '-'}"`,
      `"${c.picTechnicalPhone || '-'}"`,
      `"${c.picFinanceName || '-'}"`,
      `"${c.picFinancePhone || '-'}"`,
      `"${c.subscriptionPeriod || '-'}"`,
      `"${c.responsiblePerson || '-'}"`,
      `"${c.responsiblePersonPhone || '-'}"`,
      `"${c.npwp || '-'}"`,
      `"${c.npwpDocument ? c.npwpDocument.name : 'Tidak Ada'}"`,
      `"${c.nib || '-'}"`,
      `"${c.nibDocument ? c.nibDocument.name : 'Tidak Ada'}"`,
      `"${c.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Database_Pelanggan_ANTEN_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Database Pelanggan
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              {customers.length} Terdaftar
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => {
              setCustomerToEdit(null);
              setFormModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pelanggan</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari ID, perusahaan, PIC, sales, penanggung jawab, telpon, email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 bg-slate-50/50 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20"
          >
            <option value="all">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Prospek">Prospek</option>
            <option value="Suspended">Suspended</option>
            <option value="Tidak Aktif">Tidak Aktif</option>
          </select>
        </div>
      </div>

      {/* Table Management Container */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3.5 whitespace-nowrap">ID</th>
                <th className="py-2.5 px-3.5 whitespace-nowrap">Instansi / Perusahaan</th>
                <th className="py-2.5 px-3.5 whitespace-nowrap">Sales</th>
                <th className="py-2.5 px-3.5 whitespace-nowrap">Kontak (NOC / Teknis)</th>
                <th className="py-2.5 px-3.5 whitespace-nowrap">Kontrak</th>
                <th className="py-2.5 px-3.5 whitespace-nowrap">Status</th>
                <th className="py-2.5 px-3.5 text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">Tidak ada data pelanggan yang cocok.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Coba periksa kata kunci pencarian atau filter status.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => openCustomerDetail(customer.id)}
                  >
                    {/* Customer ID */}
                    <td className="py-3 px-3.5 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {customer.id}
                    </td>

                    {/* Perusahaan & Penanggung Jawab */}
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-900">{customer.companyName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {customer.responsiblePerson || customer.fullName} {customer.city ? `• ${customer.city}` : ''}
                      </div>
                    </td>

                    {/* Sales */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="font-medium text-slate-800">{customer.salesName || '-'}</span>
                    </td>

                    {/* Kontak Teknis / NOC */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="font-mono text-slate-700 font-medium">
                        {customer.picTechnicalPhone || customer.responsiblePersonPhone || '-'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {customer.email || 'NOC / Teknis'}
                      </div>
                    </td>

                    {/* Jangka Waktu Berlangganan */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="text-[11px] text-slate-600">
                        {customer.subscriptionPeriod || '12 Bulan'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <CustomerStatusBadge status={customer.status} />
                    </td>

                    {/* Actions */}
                    <td
                      className="py-3 px-3.5 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openCustomerDetail(customer.id)}
                          title="Lihat Detail Customer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setCustomerToEdit(customer);
                            setFormModalOpen(true);
                          }}
                          title="Edit Customer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmTarget(customer)}
                          title={
                            customer.status === 'Aktif'
                              ? 'Nonaktifkan Customer'
                              : 'Aktifkan Customer'
                          }
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            customer.status === 'Aktif'
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {customer.status === 'Aktif' ? (
                            <UserX className="w-3.5 h-3.5" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 text-xs text-slate-500">
          <div>
            Menampilkan{' '}
            <span className="font-semibold text-slate-700">
              {filteredCustomers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{' '}
            -{' '}
            <span className="font-semibold text-slate-700">
              {Math.min(currentPage * itemsPerPage, filteredCustomers.length)}
            </span>{' '}
            dari <span className="font-semibold text-slate-700">{filteredCustomers.length}</span>{' '}
            pelanggan
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <span className="px-3 py-1 text-slate-700 font-medium">
              Halaman {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Form Modal for Create & Edit */}
      <CustomerFormModal
        isOpen={formModalOpen}
        customerToEdit={customerToEdit}
        onClose={() => {
          setFormModalOpen(false);
          setCustomerToEdit(null);
        }}
        onSubmit={(data) => {
          if (customerToEdit) {
            handleUpdateCustomer(data);
          } else {
            handleCreateCustomer(data);
          }
        }}
      />

      {/* Detail Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        onClose={closeCustomerDetail}
        onEdit={(customer) => {
          closeCustomerDetail();
          setCustomerToEdit(customer);
          setFormModalOpen(true);
        }}
      />

      {/* Status Toggle Confirmation */}
      <ConfirmDialog
        isOpen={!!confirmTarget}
        title={
          confirmTarget?.status === 'Aktif'
            ? 'Nonaktifkan Pelanggan?'
            : 'Aktifkan Kembali Pelanggan?'
        }
        message={
          confirmTarget?.status === 'Aktif'
            ? `Apakah Anda yakin ingin menonaktifkan akun pelanggan ${confirmTarget?.companyName}? Layanan aktif akan tetap tercatat di sistem.`
            : `Aktifkan kembali akun pelanggan ${confirmTarget?.companyName}?`
        }
        confirmLabel={confirmTarget?.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
        variant={confirmTarget?.status === 'Aktif' ? 'danger' : 'primary'}
        onConfirm={() => {
          if (confirmTarget) {
            toggleStatus(confirmTarget);
            setConfirmTarget(null);
          }
        }}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
};
