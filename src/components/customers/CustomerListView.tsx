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
  MoreHorizontal,
  Eye,
  Edit2,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  Building2,
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
    return customers.filter((c) => {
      const matchSearch =
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.whatsapp.includes(searchQuery) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase());

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

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setCustomerToEdit(null);
              setFormModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Pelanggan</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari ID, nama, PT, WA, email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-600">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
          >
            <option value="all">Semua Status ({customers.length})</option>
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
                <th className="py-2.5 px-4">Customer ID</th>
                <th className="py-2.5 px-4">Nama / PIC</th>
                <th className="py-2.5 px-4">Perusahaan</th>
                <th className="py-2.5 px-4">NIK</th>
                <th className="py-2.5 px-4">NPWP</th>
                <th className="py-2.5 px-4">NIB</th>
                <th className="py-2.5 px-4">WhatsApp</th>
                <th className="py-2.5 px-4">Email</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
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
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {customer.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{customer.fullName}</div>
                      <div className="text-[10px] text-slate-400">{customer.picPosition || 'PIC'}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {customer.companyName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {customer.nik || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {customer.npwp || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {customer.nib || '-'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-700">
                      {customer.whatsapp}
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-[160px]">
                      {customer.email}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <CustomerStatusBadge status={customer.status} />
                    </td>
                    <td
                      className="py-3 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openCustomerDetail(customer.id)}
                          title="Lihat Detail Customer"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setCustomerToEdit(customer);
                            setFormModalOpen(true);
                          }}
                          title="Edit Customer"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmTarget(customer)}
                          title={
                            customer.status === 'Aktif'
                              ? 'Nonaktifkan Customer'
                              : 'Aktifkan Customer'
                          }
                          className={`p-1.5 rounded-lg transition-colors ${
                            customer.status === 'Aktif'
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {customer.status === 'Aktif' ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
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
        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Menampilkan{' '}
            <span className="font-semibold text-slate-900">
              {filteredCustomers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{' '}
            -{' '}
            <span className="font-semibold text-slate-900">
              {Math.min(currentPage * itemsPerPage, filteredCustomers.length)}
            </span>{' '}
            dari <span className="font-semibold text-slate-900">{filteredCustomers.length}</span>{' '}
            pelanggan
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-medium bg-white border border-slate-200 rounded-lg">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Customer Form Modal (Add & Edit) */}
      <CustomerFormModal
        isOpen={formModalOpen}
        customerToEdit={customerToEdit}
        onClose={() => {
          setFormModalOpen(false);
          setCustomerToEdit(null);
        }}
        onSubmit={customerToEdit ? handleUpdateCustomer : handleCreateCustomer}
      />

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        onClose={closeCustomerDetail}
        onEdit={(cust) => {
          closeCustomerDetail();
          setCustomerToEdit(cust);
          setFormModalOpen(true);
        }}
      />

      {/* Confirmation Dialog for Status Toggle */}
      <ConfirmDialog
        isOpen={!!confirmTarget}
        title={
          confirmTarget?.status === 'Aktif'
            ? 'Nonaktifkan Pelanggan?'
            : 'Aktifkan Kembali Pelanggan?'
        }
        message={
          confirmTarget?.status === 'Aktif'
            ? `Apakah Anda yakin ingin menonaktifkan akun ${confirmTarget?.companyName}? Layanan dan tagihan yang terkait dapat ditinjau ulang.`
            : `Aktifkan kembali status pelanggan ${confirmTarget?.companyName} agar dapat membuat layanan dan penawaran baru.`
        }
        confirmLabel={
          confirmTarget?.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'
        }
        variant={confirmTarget?.status === 'Aktif' ? 'warning' : 'primary'}
        onConfirm={() => {
          if (confirmTarget) toggleStatus(confirmTarget);
        }}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
};
